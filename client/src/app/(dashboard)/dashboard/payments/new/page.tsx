import { Banknote } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPaymentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Record Payment</h1>
        <p className="text-sm text-muted-foreground">Record a new rent payment</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Payment Form
          </CardTitle>
          <CardDescription>
            Tenancy selector, period, amount, currency, ZiG/USD rate, method, reference, and date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Coming in Phase 4 — Payment Recording</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
