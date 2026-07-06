# Notifications — Research & Implementation Plan

## How Major Platforms Handle Notifications

### Instagram / Facebook (Meta)
- **Trigger-based**: Every meaningful user action creates a notification record in a DB table
- **Categories**: Likes, comments, follows, mentions — each is a distinct `notification_type`
- **Read/Unread**: Each notification has `is_read: boolean` and `read_at: timestamp`
- **Bell badge**: Client polls or uses WebSocket to show unread count
- **Delivery channels**: In-app (bell icon) + push (mobile) + email digest

### Gmail
- **Smart filtering**: Groups similar notifications ("3 new messages from John")
- **Importance scoring**: Uses ML to decide which notifications matter
- **Digest mode**: Hourly/daily email digest instead of per-event spam

### Slack
- **Keyword alerts**: Notifies you only if specific words appear
- **Do Not Disturb**: Respects schedules — no pings at 3am
- **Channel-level settings**: Different rules per channel
- **WebSocket real-time**: Instant delivery via persistent connection

### Key insight for PropManager
The pattern is always: **Event → Record → Deliver**

---

## PropManager Notification Events

These are the events that matter to an agent:

| Event | Trigger | Priority |
|---|---|---|
| New tenant application | Prospective tenant submits form | 🔴 High |
| Rent due in 3 days | Cron job checks tenancies daily | 🟡 Medium |
| Rent overdue | Cron job — rent_due_day + 3 days passed | 🔴 High |
| Payment recorded | Agent records a payment | 🟢 Low (self-triggered) |
| Maintenance request logged | Tenant or agent logs request | 🟡 Medium |
| Maintenance status changed | Agent updates status | 🟢 Low |
| Lease expiring in 30 days | Cron job monthly check | 🟡 Medium |
| Unit becoming vacant | Tenancy ended | 🟡 Medium |
| Owner statement dispatched | Agent sends statement | 🟢 Low |
| New agent invited | Admin invites agent | 🟢 Low |

---

## Database Schema

Add this to `prisma/schema.prisma`:

```prisma
model Notification {
  id          String    @id @default(uuid()) @db.Uuid
  account_id  String    @db.Uuid
  user_id     String?   @db.Uuid          // null = broadcast to all agents
  type        String                       // e.g. 'application_new', 'rent_overdue'
  title       String
  body        String
  entity_type String?                      // 'tenancy', 'application', 'maintenance'
  entity_id   String?   @db.Uuid          // ID of the related record
  is_read     Boolean   @default(false)
  read_at     DateTime?                    @db.Timestamptz
  created_at  DateTime  @default(now())    @db.Timestamptz

  account     Account   @relation(fields: [account_id], references: [id])
  user        User?     @relation(fields: [user_id], references: [id])

  @@index([account_id, is_read])
  @@index([user_id, is_read])
  @@map("notifications")
}
```

---

## Backend Implementation

### 1. NotificationsService

```typescript
// server/src/services/notifications.service.ts

export type NotificationType =
  | 'application_new'
  | 'rent_due'
  | 'rent_overdue'
  | 'maintenance_new'
  | 'lease_expiring'
  | 'unit_vacant'
  | 'payment_received';

export async function createNotification(data: {
  accountId: string;
  userId?: string;          // specific agent, or null for all
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}) {
  return prisma.notification.create({ data: { ...data, account_id: data.accountId } });
}

export async function listNotifications(user: TokenPayload, limit = 30) {
  return prisma.notification.findMany({
    where: {
      account_id: user.accountId,
      OR: [{ user_id: user.sub }, { user_id: null }], // own + broadcasts
    },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

export async function markRead(id: string, user: TokenPayload) {
  return prisma.notification.updateMany({
    where: { id, account_id: user.accountId },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function markAllRead(user: TokenPayload) {
  return prisma.notification.updateMany({
    where: { account_id: user.accountId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  });
}

export async function getUnreadCount(user: TokenPayload) {
  return prisma.notification.count({
    where: { account_id: user.accountId, is_read: false,
      OR: [{ user_id: user.sub }, { user_id: null }] },
  });
}
```

### 2. Trigger notifications from existing services

Add `createNotification()` calls inside existing services:

```typescript
// In applications.service.ts — after application is created:
await createNotification({
  accountId: unit.account_id,
  type: 'application_new',
  title: 'New Application',
  body: `${data.applicantName} applied for ${unit.property.name} - ${unit.unit_number}`,
  entityType: 'application',
  entityId: application.id,
});

// In maintenance.service.ts — after create():
await createNotification({
  accountId: user.accountId,
  type: 'maintenance_new',
  title: 'Maintenance Request',
  body: `${data.title} — ${unit.property.name} Unit ${unit.unit_number}`,
  entityType: 'maintenance_request',
  entityId: request.id,
});

// In payments.service.ts — after payment is recorded:
await createNotification({
  accountId: user.accountId,
  userId: user.sub,
  type: 'payment_received',
  title: 'Payment Recorded',
  body: `${currency} ${amount} received from ${tenant.full_name}`,
  entityType: 'payment',
  entityId: payment.id,
});
```

### 3. Cron jobs (node-cron — already in server deps)

```typescript
// server/src/jobs/notifications.job.ts
import cron from 'node-cron';

// Daily at 8am: check rent due in 3 days
cron.schedule('0 8 * * *', async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const dueTenancies = await prisma.tenancy.findMany({
    where: { status: 'active', rent_due_day: threeDaysFromNow.getDate() },
    include: { tenant: true, unit: { include: { property: true } } },
  });

  for (const t of dueTenancies) {
    await createNotification({
      accountId: t.account_id,
      type: 'rent_due',
      title: 'Rent Due Soon',
      body: `${t.tenant.full_name} — rent due in 3 days (${t.unit.property.name} ${t.unit.unit_number})`,
      entityType: 'tenancy',
      entityId: t.id,
    });
  }
});

// Monthly: check leases expiring in 30 days
cron.schedule('0 9 1 * *', async () => {
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  // ... similar pattern
});
```

### 4. API routes

```typescript
// GET  /api/notifications          — list (with ?limit=30&unread_only=true)
// GET  /api/notifications/count    — { count: number } for bell badge
// PATCH /api/notifications/:id/read
// PATCH /api/notifications/mark-all-read
```

---

## Frontend Implementation

### Bell Icon in Navbar

```tsx
// Polls /api/notifications/count every 30 seconds
function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = () =>
      apiClient('/notifications/count').then(r => setCount(r.data?.count ?? 0));
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/notifications')}>
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{count > 99 ? '99+' : count}</Badge>
      )}
    </Button>
  );
}
```

### Notifications Page `/dashboard/notifications`

- List all notifications, grouped by date ("Today", "This Week", "Earlier")
- Unread items have a coloured left border and bold text
- Click → navigate to the entity (e.g. `/dashboard/applications/[id]`)
- "Mark all read" button
- Filter: All | Unread | Applications | Maintenance | Payments

---

## Delivery Channels (phased rollout)

### Phase 1 — In-App (implement now)
- DB-stored, bell badge, notifications page
- Cost: $0, no extra infra

### Phase 2 — Email digest (next sprint)
- Daily/weekly email via Resend listing unread notifications
- User preference: immediate | daily | weekly | never

### Phase 3 — WhatsApp alerts (future)
- For overdue rent and new applications
- Via wa.me URL (current approach) or WhatsApp Business API

### Phase 4 — Push notifications (future)
- Web Push API (service worker) — now that PWA is removed, skip until native app
- Or use a service like OneSignal

---

## What NOT to notify (anti-spam rules)

Based on how Instagram/Slack handle this — users hate notification spam:

- ❌ Don't notify for every login
- ❌ Don't notify when an agent views a page
- ❌ Don't notify for system health checks
- ❌ Don't send email + in-app for the same event unless it's high-priority (rent overdue)
- ❌ Don't notify the agent who triggered the action (e.g. agent records payment → don't notify themselves)

---

## Priority for next sprint

1. Add `Notification` model to Prisma schema + migrate
2. Build `NotificationsService` with create/list/markRead/count
3. Wire notifications into: applications, maintenance, payments, cron rent check
4. Build API routes
5. Add bell icon to navbar with unread badge
6. Build `/dashboard/notifications` page
