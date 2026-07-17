import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle } from "lucide-react";
import { CommunicationDto } from "@/hooks/useCommunications";

interface CommunicationLogTableProps {
  records: CommunicationDto[];
}

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === "email") {
    return (
      <Badge variant="outline" className="flex items-center gap-1 w-fit">
        <Mail className="h-3 w-3" />
        Email
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="flex items-center gap-1 w-fit text-green-600 border-green-300">
      <MessageCircle className="h-3 w-3" />
      WhatsApp
    </Badge>
  );
}

export function CommunicationLogTable({ records }: CommunicationLogTableProps) {
  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md">
        No communications found. Use the Compose button to send a message.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Subject / Preview</TableHead>
            <TableHead>Sent By</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((rec) => {
            const recipient = rec.tenant ?? rec.owner;
            const recipientType = rec.tenant ? "Tenant" : "Owner";
            return (
              <TableRow key={rec.id}>
                <TableCell className="font-medium">
                  {recipient?.full_name ?? "-"}
                  <Badge variant="secondary" className="ml-2 text-xs font-normal">{recipientType}</Badge>
                </TableCell>
                <TableCell>
                  <ChannelBadge channel={rec.channel} />
                </TableCell>
                <TableCell className="max-w-xs">
                  {rec.subject ? (
                    <span className="font-medium text-sm">{rec.subject}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm line-clamp-1">
                      {rec.body ?? "-"}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {rec.sender?.full_name ?? "System"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(rec.sent_at), "dd MMM yyyy, HH:mm")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
