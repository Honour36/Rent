"use client";

import { useEffect, useState, useCallback } from "react";
import { useCommunications, CommunicationDto } from "@/hooks/useCommunications";
import { CommunicationLogTable } from "@/components/communications/CommunicationLogTable";
import { ComposeDrawer } from "@/components/communications/ComposeDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenSquare, Search } from "lucide-react";

export default function CommunicationsPage() {
  const { listCommunications, loading } = useCommunications();

  const [records, setRecords] = useState<CommunicationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [channelFilter, setChannelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchCommunications = useCallback(async () => {
    const result = await listCommunications({ channel: channelFilter });
    setRecords(result.records);
    setTotal(result.total);
  }, [listCommunications, channelFilter]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  const filtered = search.trim()
    ? records.filter(
        (r) =>
          r.tenant.full_name.toLowerCase().includes(search.toLowerCase()) ||
          r.subject?.toLowerCase().includes(search.toLowerCase()) ||
          r.body?.toLowerCase().includes(search.toLowerCase()),
      )
    : records;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
            <p className="text-muted-foreground mt-1">
              Full outbound message log — email and WhatsApp.
              {total > 0 && (
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                  {total} total
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setComposeOpen(true)} className="flex items-center gap-2">
            <PenSquare className="h-4 w-4" />
            Compose
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by tenant or message…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground border rounded-md">
            Loading communications…
          </div>
        ) : (
          <CommunicationLogTable records={filtered} />
        )}
      </div>

      <ComposeDrawer
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSuccess={fetchCommunications}
      />
    </>
  );
}
