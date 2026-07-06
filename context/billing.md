# PropManager — Billing Plans

> Prices are in **USD per month**, billed monthly. Annual billing gives 2 months free.

---

## Plan Comparison

| Feature | Free | Starter | Growth | Professional |
|---|---|---|---|---|
| **Price/month** | $0 | $15 | $35 | $75 |
| **Properties** | 1 | 5 | 20 | Unlimited |
| **Units** | 5 | 20 | 100 | Unlimited |
| **Agents** | 1 | 2 | 5 | Unlimited |
| **Owners** | 1 | 5 | 20 | Unlimited |
| **Storage** | 500 MB | 2 GB | 10 GB | 50 GB |
| Payment recording & receipts | ✅ | ✅ | ✅ | ✅ |
| Tenant applications | ✅ | ✅ | ✅ | ✅ |
| Email reminders (Resend) | ✅ | ✅ | ✅ | ✅ |
| Owner statements & reports | ❌ | ✅ | ✅ | ✅ |
| Maintenance tracking | ❌ | ✅ | ✅ | ✅ |
| WhatsApp dispatch | ❌ | ✅ | ✅ | ✅ |
| Communications centre | ❌ | ❌ | ✅ | ✅ |
| Bulk rent reminders | ❌ | ❌ | ✅ | ✅ |
| Trust ledger | ❌ | ❌ | ✅ | ✅ |
| Full contact management | ❌ | ❌ | ❌ | ✅ |
| Custom branding & templates | ❌ | ❌ | ❌ | ✅ |
| Advanced analytics | ❌ | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| Dedicated support | ❌ | ❌ | ❌ | ✅ |

---

## Plan Details

### Free — $0/month
Best for individual landlords trying out the system.
- 1 property, up to 5 units
- 1 agent (admin only)
- Payment recording and PDF receipts
- Tenant application form (public link)
- 500 MB document storage
- Email rent reminders via Resend

### Starter — $15/month
Perfect for small independent agencies.
- Up to 5 properties, 20 units
- 2 agents
- 5 owners
- Owner statements and all 7 report types
- Maintenance request tracking
- WhatsApp + email dispatch
- 2 GB document storage (leases, receipts, statements in Supabase buckets)

### Growth — $35/month ⭐ Most Popular
For growing property agencies managing multiple portfolios.
- Up to 20 properties, 100 units
- 5 agents
- 20 owners
- Full communications centre (compose, log, history)
- Bulk rent reminders (automated cron)
- Trust ledger report
- 10 GB document storage
- Priority support

### Professional — $75/month
Unlimited scale — full contact management suite.
- Unlimited properties, units, agents, owners
- Full contact management (tenant, owner, guarantor profiles)
- Custom branding and email templates
- 50 GB document storage
- Advanced analytics dashboard
- Dedicated support line

---

## How to Upgrade

Currently, upgrades are handled manually. Contact support:

📧 **support@propmanager.app**  
Subject: `Upgrade to [Plan Name]`

Include your account name and the plan you want. Invoicing is done via **Innbucks / EcoCash / USD bank transfer** (Zimbabwean accounts) or **Stripe** (international).

---

## Tier Enforcement

Limits are enforced server-side via `server/src/middleware/tier.middleware.ts`.

When a limit is reached, the API returns:
```json
{
  "success": false,
  "error": "Your starter plan allows a maximum of 5 owners. Upgrade your plan to add more.",
  "code": "TIER_LIMIT_REACHED"
}
```

The frontend reads this `code` and shows an upgrade prompt.

---

## Document Storage (Supabase Buckets)

All generated documents are stored in Supabase Storage and served via signed URLs (1-hour expiry).

| Bucket | Contents |
|---|---|
| `receipts` | Payment receipt PDFs |
| `leases` | Signed lease agreement PDFs |
| `statements` | Owner statement PDFs |
| `documents` | Tenant ID uploads, misc |
| `branding` | Logo uploads for custom branding |

Each path follows: `{bucket}/{accountId}/{resourceId}.pdf`

---

*Last updated: 2026-07-07*
