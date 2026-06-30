# UI Registry

Living document. Updated after every component is built via `/imprint`. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then run `/imprint` to add it here

After building any component — run `/imprint [filepath]` to update this file.

---

## Baseline — Established 2026-06-27

Note: Baseline derived from next-shadcn-admin-dashboard template before any custom components are built.

| Property              | Correct class / token                                  |
| --------------------- | ------------------------------------------------------ |
| Page background       | `bg-background`                                        |
| Card background       | `bg-card` (shadcn `<Card>` component)                  |
| Card border           | `border border-border` (handled by Card component)     |
| Card radius           | `rounded-xl` (handled by Card component)               |
| Card padding          | `p-6` (use `<CardContent>` with default padding)       |
| Button — primary      | `bg-primary text-primary-foreground` via `<Button>`    |
| Button — secondary    | `bg-secondary text-secondary-foreground` via `<Button variant="secondary">` |
| Button — outline      | `border border-input bg-background` via `<Button variant="outline">` |
| Button — ghost        | `hover:bg-accent hover:text-accent-foreground` via `<Button variant="ghost">` |
| Button — destructive  | `bg-destructive text-white` via `<Button variant="destructive">` |
| Text — primary        | `text-foreground`                                      |
| Text — secondary      | `text-muted-foreground`                                |
| Input background      | `bg-background`                                        |
| Input border          | `border border-input`                                  |
| Input focus           | `ring-1 ring-ring` (handled by shadcn `<Input>`)       |
| Table header text     | `text-xs font-medium uppercase text-muted-foreground`  |
| Table row hover       | `hover:bg-muted/50`                                    |
| Badge — default       | `bg-primary text-primary-foreground` (paid, active)    |
| Badge — secondary     | `bg-secondary text-secondary-foreground` (pending, partial) |
| Badge — outline       | `border border-border text-foreground` (vacant, draft) |
| Badge — destructive   | `bg-destructive text-white` (late, unpaid, emergency)  |
| Section gap           | `gap-6`                                                |
| Internal element gap  | `gap-4`                                                |

---

## Components

### Dialog Modals (AddPropertyDialog, AddUnitDialog)
- **Container**: `DialogContent` with `sm:max-w-[425px]`
- **Header**: `DialogHeader` > `DialogTitle` + `DialogDescription`
- **Form Layout**: `grid gap-4 py-4`
- **Form Fields**: 
  - `grid grid-cols-4 items-center gap-4`
  - `Label` with `text-right`
  - `Input` or `NativeSelect` with `col-span-3`
- **Actions**: `DialogFooter` > `Button type="submit"`

### UnitCard
- **Layout**: `Card`
- **Header**: `CardHeader` with `flex flex-row items-center justify-between space-y-0 pb-2`
- **Title**: `CardTitle text-sm font-medium`
- **Status Badge (Occupied)**: `Badge variant="default"` + `bg-green-600 hover:bg-green-600/80`
- **Status Badge (Vacant)**: `Badge variant="outline"` + `border-amber-500 text-amber-500`
- **Status Badge (Maintenance)**: `Badge variant="destructive"`
- **Content Main Value**: `text-2xl font-bold` (for rent amount)
- **Content Subtext**: `text-sm font-normal text-muted-foreground` (for `/mo` suffix)
- **Details Section**: `mt-4 flex flex-col gap-1 text-sm text-muted-foreground`
