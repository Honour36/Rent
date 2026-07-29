"use client";

import { useState } from "react";
import { Trash2, X } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [confirmText, setConfirmText] = useState("");

  if (count === 0) return null;

  // Same pattern as Clerk/GitHub/Vercel destructive confirmations: nothing
  // happens until the person types the exact expected value. For a bulk
  // selection there's no single name to type, so the count stands in for
  // it - typing the count is both a match check and a re-statement of how
  // many records are about to be permanently removed.
  const expected = String(count);
  const isConfirmed = confirmText.trim() === expected;

  const openDialog = () => {
    setConfirmText("");
    setConfirmOpen(true);
  };

  const closeDialog = (open: boolean) => {
    if (deleting) return;
    setConfirmOpen(open);
    if (!open) setConfirmText("");
  };

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setDeleting(true);
    await onConfirmDelete();
    setDeleting(false);
    setConfirmOpen(false);
    setConfirmText("");
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
          <Button variant="destructive" size="sm" onClick={openDialog}>
            <Trash2 className="h-4 w-4" />Delete Selected
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} {count === 1 ? entityLabelSingular : entityLabelPlural}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This cannot be undone. All {count} selected {count === 1 ? entityLabelSingular : entityLabelPlural} and their
                  associated records will be permanently removed.
                </p>
                <p>
                  Type <span className="font-semibold text-foreground">{expected}</span> to confirm.
                </p>
                <Input
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expected}
                  disabled={deleting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isConfirmed && !deleting) handleConfirm();
                  }}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={deleting || !isConfirmed}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
