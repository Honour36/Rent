<!-- UI tokens: the design system values the agent must use for all styling -->

# UI Tokens

Design tokens for the Zimbabwe Property Management System. This project uses the next-shadcn-admin-dashboard template's existing token system — do not redefine tokens. Use the tokens already declared in globals.css via the template's `@theme inline` block.

---

## How to Use

This project uses **Tailwind CSS v4** with shadcn/ui. All tokens are already defined in `app/globals.css` via `@theme inline`. Tailwind automatically generates utility classes from these CSS variables.

```tsx
// Correct — uses generated utility classes
className="bg-card text-foreground border-border"

// Also correct — references CSS variable directly (rare, for non-Tailwind contexts)
style={{ color: 'var(--foreground)' }}

// Never — hardcoded hex values
className="bg-[#F6F7FB] text-[#101828]"

// Never — raw Tailwind color classes
className="bg-gray-100 text-gray-900"
```

---

## Token Reference (from template globals.css)

### Surfaces

| Token class        | CSS Variable     | Use                                    |
| ------------------ | ---------------- | -------------------------------------- |
| `bg-background`    | `--background`   | Page background                        |
| `bg-card`          | `--card`         | Card / panel backgrounds               |
| `bg-popover`       | `--popover`      | Dropdown, popover backgrounds          |
| `bg-muted`         | `--muted`        | Subtle background (table header, chip) |
| `bg-accent`        | `--accent`       | Hover states, accent backgrounds       |
| `bg-primary`       | `--primary`      | Primary button background              |
| `bg-secondary`     | `--secondary`    | Secondary button background            |
| `bg-destructive`   | `--destructive`  | Error / danger backgrounds             |

### Text

| Token class              | CSS Variable              | Use                              |
| ------------------------ | ------------------------- | -------------------------------- |
| `text-foreground`        | `--foreground`            | Primary text                     |
| `text-muted-foreground`  | `--muted-foreground`      | Secondary / muted text, labels   |
| `text-card-foreground`   | `--card-foreground`       | Text on cards                    |
| `text-primary-foreground`| `--primary-foreground`    | Text on primary buttons          |
| `text-destructive`       | `--destructive`           | Error text                       |

### Borders

| Token class      | CSS Variable  | Use                        |
| ---------------- | ------------- | -------------------------- |
| `border-border`  | `--border`    | All default borders        |
| `border-input`   | `--input`     | Form input borders         |
| `ring-ring`      | `--ring`      | Focus rings                |

### Sidebar (template already handles these)

| Token class                     | Use                          |
| ------------------------------- | ---------------------------- |
| `bg-sidebar`                    | Sidebar background           |
| `text-sidebar-foreground`       | Sidebar text                 |
| `bg-sidebar-accent`             | Sidebar hover / active bg    |
| `text-sidebar-accent-foreground`| Sidebar active text          |
| `border-sidebar-border`         | Sidebar border               |

### Charts

| Token class   | Use                    |
| ------------- | ---------------------- |
| `--chart-1`   | First data series      |
| `--chart-2`   | Second data series     |
| `--chart-3`   | Third data series      |
| `--chart-4`   | Fourth data series     |
| `--chart-5`   | Fifth data series      |

Use chart tokens via the ChartConfig pattern — never reference them directly in JSX.

---

## Status Color Mapping

Map application status values to shadcn Badge variants (which use the token system internally):

| Status value          | Badge variant   |
| --------------------- | --------------- |
| `paid`                | `default`       |
| `occupied`            | `default`       |
| `active`              | `default`       |
| `partial`             | `secondary`     |
| `pending`             | `secondary`     |
| `notice`              | `secondary`     |
| `vacant`              | `outline`       |
| `draft`               | `outline`       |
| `ended`               | `outline`       |
| `late`                | `destructive`   |
| `unpaid`              | `destructive`   |
| `rejected`            | `destructive`   |
| `emergency`           | `destructive`   |
| `maintenance`         | `destructive`   |

---

## Border Radius

The template uses a single `--radius` variable that scales all radius values:

| Class          | Value                        | Use                     |
| -------------- | ---------------------------- | ----------------------- |
| `rounded-sm`   | `calc(var(--radius) - 4px)`  | Inputs, small elements  |
| `rounded-md`   | `calc(var(--radius) - 2px)`  | Buttons                 |
| `rounded-lg`   | `var(--radius)`              | Cards, dialogs          |
| `rounded-xl`   | `calc(var(--radius) + 4px)`  | Large cards             |
| `rounded-full` | `9999px`                     | Badges, avatars         |

Default `--radius` is `0.625rem` (10px) in the template. Do not override.

---

## Spacing

Follow the template's established spacing — do not introduce new spacing values:

| Class     | Value | Use                                    |
| --------- | ----- | -------------------------------------- |
| `gap-2`   | 8px   | Icon + label gaps, badge gaps          |
| `gap-4`   | 16px  | Form field gaps, section internal gaps |
| `gap-6`   | 24px  | Between page sections / card groups    |
| `p-4`     | 16px  | Compact card padding                   |
| `p-6`     | 24px  | Standard card padding                  |
| `px-4 py-2` | 16/8px | Button padding                      |

---

## Typography Scale

| Element            | Class                             |
| ------------------ | --------------------------------- |
| Page heading       | `text-2xl font-bold`              |
| Section / card heading | `text-lg font-semibold`       |
| KPI / stat value   | `text-3xl font-bold`              |
| Body text          | `text-sm font-medium`             |
| Secondary / label  | `text-sm text-muted-foreground`   |
| Micro / timestamp  | `text-xs text-muted-foreground`   |
| Table header       | `text-xs font-medium uppercase text-muted-foreground` |

Font family: **Geist** — already configured in template. Never change.

---

## Invariants

- Never use hex values directly in components — always use CSS variable classes
- Never define new CSS variables or Tailwind tokens — use only what the template provides
- Never use raw Tailwind color scales (`text-gray-500`, `bg-blue-100`) — use semantic token classes
- Never override `--radius` or font variables — the template's values are the standard
- All status colors go through Badge component variants — never custom badge backgrounds
- Dark mode is handled by the template's token system automatically — never write `.dark:` overrides manually
