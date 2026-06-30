import { Wrench } from "lucide-react";

import { MaintenanceListTable } from "@/components/maintenance/MaintenanceListTable";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <p className="text-sm text-muted-foreground">Track and manage maintenance requests</p>
      </div>

      <MaintenanceListTable />
    </div>
  );
}
