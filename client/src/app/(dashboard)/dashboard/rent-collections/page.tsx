"use client";

import { Calendar as CalendarIcon, Clock, DollarSign, Loader2 } from "@/components/icons";

import { useRentCollections } from "@/hooks/useRentCollections";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RentCollectionsPage() {
  const { requests, loading, error } = useRentCollections();

  const scheduled = requests
    .filter((r) => r.status === "scheduled" && r.scheduled_for)
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime());
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rent Collections</h1>
        <p className="text-sm text-muted-foreground">
          When each owner has said they'll collect the rent that's come in for their property.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        <>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Upcoming ({scheduled.length})</h2>
            {scheduled.length === 0 ? (
              <p className="text-sm text-muted-foreground">No collection dates set yet.</p>
            ) : (
              <div className="space-y-3">
                {scheduled.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">
                          {r.payment.tenancy.unit.property.name} - {r.payment.tenancy.unit.unit_number}
                        </p>
                        <p className="text-sm text-muted-foreground">Owner: {r.owner.full_name}</p>
                        {r.notes && <p className="text-sm text-muted-foreground mt-1">"{r.notes}"</p>}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5 justify-end text-sm font-medium">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {new Date(r.scheduled_for!).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(r.scheduled_for!).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-xs text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" />
                          {r.payment.currency} {Number(r.payment.amount_paid).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">Awaiting Owner Response ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing waiting on an owner right now.</p>
            ) : (
              <div className="space-y-2">
                {pending.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">
                          {r.payment.tenancy.unit.property.name} - {r.payment.tenancy.unit.unit_number}
                        </p>
                        <p className="text-xs text-muted-foreground">Owner: {r.owner.full_name}</p>
                      </div>
                      <Badge variant="secondary">Awaiting response</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
