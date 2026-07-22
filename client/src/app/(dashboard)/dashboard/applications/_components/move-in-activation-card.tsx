import { useState, useEffect } from "react";
import { FileText, Loader2, CheckCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenancies } from "@/hooks/useTenancies";

interface Props {
  unitId: string;
  defaultRent: number;
  onActivated?: () => void;
}

export function MoveInActivationCard({ unitId, defaultRent, onActivated }: Props) {
  const { getPendingByUnitId, activateTenancy, loading, error } = useTenancies();
  const [tenancyId, setTenancyId] = useState<string | null>(null);
  
  const [rentAmount, setRentAmount] = useState(defaultRent.toString());
  const [depositAmount, setDepositAmount] = useState("");
  const [leaseStartDate, setLeaseStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rentDueDay, setRentDueDay] = useState("1");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPendingByUnitId(unitId).then((res) => {
      if (res?.id) setTenancyId(res.id);
    });
  }, [unitId, getPendingByUnitId]);

  const handleActivate = async () => {
    if (!tenancyId) return;
    const res = await activateTenancy(tenancyId, {
      rentAmount: Number(rentAmount),
      depositAmount: depositAmount ? Number(depositAmount) : undefined,
      leaseStartDate: new Date(leaseStartDate).toISOString(),
      rentDueDay: Number(rentDueDay),
    });
    if (res.success) {
      setSuccess(true);
      onActivated?.();
    }
  };

  if (!tenancyId && !loading && !success) {
    return null; // Tenancy might already be active or missing
  }

  if (success) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
          <p className="font-medium">Lease Activated!</p>
          <p className="text-sm text-muted-foreground mt-1">
            The tenancy is now active and the unit is occupied.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Move-In Activation
        </CardTitle>
        <CardDescription>
          Finalize lease details and generate the lease agreement.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rentAmount">Rent Amount</Label>
            <Input
              id="rentAmount"
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="depositAmount">Deposit (Optional)</Label>
            <Input
              id="depositAmount"
              type="number"
              placeholder="e.g. 1000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leaseStartDate">Lease Start Date</Label>
            <Input
              id="leaseStartDate"
              type="date"
              value={leaseStartDate}
              onChange={(e) => setLeaseStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rentDueDay">Rent Due Day</Label>
            <Input
              id="rentDueDay"
              type="number"
              min="1"
              max="28"
              value={rentDueDay}
              onChange={(e) => setRentDueDay(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full mt-2"
          onClick={handleActivate}
          disabled={loading || !tenancyId}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Lease & Activate
        </Button>
      </CardContent>
    </Card>
  );
}
