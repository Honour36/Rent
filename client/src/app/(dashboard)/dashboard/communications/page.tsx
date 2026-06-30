import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunicationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Communications</h1>
        <p className="text-sm text-muted-foreground">Compose and log all tenant communications</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Log
          </CardTitle>
          <CardDescription>Full communication log with compose panel for WhatsApp and email messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Coming in Phase 5 — Communications Centre</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
