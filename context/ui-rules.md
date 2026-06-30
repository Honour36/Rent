<!-- UI rules: how the interface behaves — layout, interactions, and component patterns -->

# UI Rules

Concise rules for building the Zimbabwe Property Management System UI. The next-shadcn-admin-dashboard template is the source of truth for visual decisions — these rules define what changes, what stays, and what new patterns apply.

---

## Template Philosophy

The next-shadcn-admin-dashboard template is repurposed, not redesigned. Do not change:
- Fonts (Geist)
- Color token system (CSS variables in globals.css)
- Card dimensions and border radius
- Chart library and chart style
- Sidebar component structure
- Spacing scale

Only change:
- Sidebar navigation items and groups (replace with property management nav)
- Page content — replace placeholder dashboards with property management content
- Data in tables and charts — replace with property management data shapes

---

## Font

Font is Geist, already configured via `next/font/google` in the template's root layout. Do not change the font. The `--font-sans` variable is already wired. Never import a different font.

---

## Layout

- Sidebar layout — the template's sidebar + main content area structure is kept as-is
- Page max-width: full width within the sidebar content area (template default)
- Content padding: as defined in the template's dashboard layout.tsx — do not override
- Gap between page sections: `gap-6` (24px) — consistent with template
- All authenticated pages use the sidebar layout from `(dashboard)/layout.tsx`
- The public application form (`/application/[token]`) uses a standalone layout — no sidebar

---

## Sidebar Navigation

Replace the template's sidebar items with these groups and items (update `sidebar-items.ts`):

**Group: Main**
- Overview → `/dashboard/overview` — icon: `LayoutDashboard`
- Properties → `/dashboard/properties` — icon: `Building2`
- Tenants → `/dashboard/tenants` — icon: `Users`
- Applications → `/dashboard/applications` — icon: `ClipboardList`
- Payments → `/dashboard/payments` — icon: `Banknote`
- Communications → `/dashboard/communications` — icon: `MessageSquare`
- Maintenance → `/dashboard/maintenance` — icon: `Wrench`
- Reports → `/dashboard/reports` — icon: `ChartBar`

**Group: Management**
- Owners → `/dashboard/owners` — icon: `UserCheck`
- Agents → `/dashboard/agents` — icon: `UserCog`
- Settings → `/dashboard/settings` — icon: `Settings`

Remove: Legacy group, Misc group, all original dashboard variants (CRM, Finance, Analytics, etc.), Chat, Calendar, Kanban, Tasks, Invoice, Roles, Authentication sub-items.

Keep: Sidebar component structure, search dialog, user nav footer, account switcher.

---

## Cards

Use the template's existing `<Card>` component from shadcn/ui. Do not re-implement cards. The template's card has:
- `bg-card` background
- `border border-border` border
- `rounded-xl` radius
- `p-6` padding

Never use colored card backgrounds. Color goes inside cards via badges, status indicators, and chart fills — never on the card surface.

---

## Typography Hierarchy

Follow the template's established patterns exactly:

**Section headings** — card titles, page headings
- Use `<CardTitle>` from shadcn/ui or `text-lg font-semibold`

**Body / primary content**
- `text-sm font-medium text-foreground`

**Secondary / muted text** — labels, timestamps, subtitles
- `text-sm text-muted-foreground`

**Stat numbers / KPI values**
- `text-2xl font-bold` (or `text-3xl` for the hero stat on a KPI card)

---

## Status Badges

All status indicators use shadcn/ui `<Badge>` component. Standard variants:

| Status    | Badge variant | Use for                                  |
| --------- | ------------- | ---------------------------------------- |
| Paid      | `default`     | Payment status — paid in full             |
| Occupied  | `default`     | Unit occupancy                            |
| Active    | `default`     | Tenancy, agent status                     |
| Partial   | `secondary`   | Part-paid payment                         |
| Pending   | `secondary`   | Application awaiting review               |
| Vacant    | `outline`     | Unit occupancy                            |
| Late      | `destructive` | Payment overdue                           |
| Unpaid    | `destructive` | Payment not made                          |
| Overdue   | `destructive` | Arrears                                   |
| Emergency | `destructive` | Maintenance priority                      |
| Draft     | `outline`     | Owner statement not yet approved          |

Never use raw color classes for status — always use Badge component with above variants.

---

## KPI Cards (Overview Dashboard)

Use the template's `metric-cards` pattern: a row of cards each showing:
- Label (muted, small)
- Value (large, bold)
- Trend indicator (up/down arrow + percentage) where applicable

Property management KPI cards:
- Total Units / Occupied / Vacant (with vacancy %)
- Arrears Count + Amount
- Collection Rate % (current month)
- Maintenance Open Requests

---

## Tables

Use TanStack Table via the template's existing data table pattern. Rules:
- No alternating row colors — separated by border only
- Column headers: uppercase, `text-xs font-medium text-muted-foreground`
- Row text: `text-sm text-foreground`
- Hover: `hover:bg-muted/50`
- Sortable columns use the template's existing sort indicator pattern
- Paginate tables with more than 20 rows — use the template's pagination component

---

## Charts

Use the template's Recharts setup via `@/components/ui/chart`. The chart configuration pattern (ChartConfig, ChartContainer, ChartTooltipContent) is already defined — always use it. Do not import Recharts directly.

Property management charts:
- Overview: Area chart — rent collected vs rent due (last 6 months) — matches template's area chart style
- Collection rate trend: Line chart
- Vacancy trend: Bar chart

---

## Forms & Modals

- Forms inside modals use `<Dialog>` from shadcn/ui
- Forms inline on a page use a full-width layout within a `<Card>`
- All form fields use shadcn/ui `<Input>`, `<Select>`, `<Textarea>` — never raw HTML inputs
- Currency inputs: right-aligned, always show currency symbol prefix via `<InputGroup>` pattern
- Date inputs: use shadcn/ui `<Calendar>` inside a `<Popover>`
- Form validation errors: below the field, `text-xs text-destructive`
- Submission loading state: disable submit button and show spinner inside it

---

## Empty States

Every table or list that can be empty must show an empty state:
- Icon (relevant to the entity — e.g. Building2 for properties)
- Short message in `text-muted-foreground`
- CTA button if there's a logical action (e.g. "Add Property")

Use the template's `<Empty>` component if available, otherwise build consistently.

---

## WhatsApp Action Pattern

WhatsApp is opened via a link — not an API call. The pattern everywhere:
```tsx
<Button
  variant="outline"
  onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')}
>
  <MessageSquare className="h-4 w-4 mr-2" />
  Send via WhatsApp
</Button>
```
After the agent opens WhatsApp, log the communication via API. Never tell the user the message was sent automatically — label it "Open WhatsApp".

---

## Currency Display

Always use the `formatCurrency` utility. Never format inline.

```typescript
// ZiG 1,250.00
formatCurrency(1250, 'ZiG')  // → "ZiG 1,250.00"

// $450.00
formatCurrency(450, 'USD')   // → "$450.00"
```

When displaying dual currency (ZiG amount with USD equivalent), show primary currency large and secondary smaller in muted text below.

---

## Offline Indicator

When the app detects it is offline (via `navigator.onLine` event):
- Show a persistent banner below the header: amber background, "You are offline — payments will be queued and sent when reconnected"
- Payment recording form still works — submits to offline queue
- All other write actions show a disabled state with tooltip "Requires connection"
- When reconnected: banner disappears, show a toast "Back online — syncing queued payments..."

---

## Do Nots

- Never redesign the sidebar component — only update its data (items list)
- Never change the template's color tokens or CSS variables
- Never add a top navbar — sidebar-only layout
- Never use Tailwind's raw color classes (`bg-blue-500`) — use token classes only (`bg-primary`)
- Never show raw error messages or database errors to the user
- Never use `<form>` HTML element for submission — use button onClick handlers with state
- Never show a loading spinner for more than 2 seconds without a meaningful progress indicator
- Never open WhatsApp and claim the message was automatically sent
