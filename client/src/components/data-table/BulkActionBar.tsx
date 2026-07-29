"use client";

import { useState } from "react";
import { Trash2, X } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkActionBarProps {
  count: number;
  entityLabelSingular: string;
  entityLabelPlural: string;
  onClear: () => void;
  onConfirmDelete: () => Promise<void>;
}

export function BulkActionBar({ count, entityLabelSingular, entityLabelPlural, onClear, onConfirmDelete }: BulkActionBarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (count === 0) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirmDelete();
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-muted/50 px-4 py-2">
        <p className="text-sm font-medium">
          {count} {count === 1 ? entityLabelSingular : entityLabelPlural} selected
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />Clear
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />Delete Selected
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(v) => { if (!deleting) setConfirmOpen(v); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} {count === 1 ? entityLabelSingular : entityLabelPlural}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Each selected {entityLabelSingular} and its associated records will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
