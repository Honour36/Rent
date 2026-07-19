"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Download, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { useChecklistTemplates, ChecklistTemplateDto, ChecklistTemplateItemDto } from "@/hooks/useChecklistTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ChecklistsPage() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ChecklistTemplateItemDto[]>([]);
  const [newSection, setNewSection] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChecklistTemplateDto | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setItems([]);
    setNewSection("");
    setNewLabel("");
    setOpen(true);
  };

  const openEdit = (t: ChecklistTemplateDto) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description ?? "");
    setItems(t.items.map(i => ({ section: i.section, label: i.label })));
    setNewSection("");
    setNewLabel("");
    setOpen(true);
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    setItems([...items, { section: newSection.trim() || undefined, label: newLabel.trim() }]);
    setNewLabel("");
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!name.trim() || items.length === 0) {
      toast.warning("Give the checklist a name and at least one item.");
      return;
    }
    setSaving(true);
    const payload = { name: name.trim(), description: description.trim() || undefined, items };
    const res = editingId ? await updateTemplate(editingId, payload) : await createTemplate(payload);
    setSaving(false);
    if (res.success) {
      toast.success(editingId ? "Checklist updated." : "Checklist created.");
      setOpen(false);
    } else {
      toast.error("Could not save checklist", { description: (res as any).error });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteTemplate(deleteTarget.id);
    if (res.success) {
      toast.success("Checklist deleted.");
    } else {
      toast.error("Could not delete checklist", { description: (res as any).error });
    }
    setDeleteTarget(null);
  };

  const downloadPdf = (id: string) => {
    window.open(`${API_BASE}/checklist-templates/${id}/pdf`, "_blank");
  };

  // Group current items by section for a live preview while editing
  const grouped = items.reduce<Record<string, ChecklistTemplateItemDto[]>>((acc, item) => {
    const key = item.section?.trim() || "Checklist";
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspection Checklists</h1>
          <p className="text-sm text-muted-foreground">
            Build your own reusable checklist (e.g. by room) to use when conducting inspections, and download it as a blank form.
          </p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />New Checklist</Button>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && (
        templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No checklists yet - create one to use across your inspections.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" />{t.name}</p>
                    {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{t.items.length} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(t.id)}><Download className="h-3.5 w-3.5 mr-1.5" />PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleteTarget(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Checklist" : "New Checklist"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Move-In/Move-Out Checklist" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Add Item</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder="Section (e.g. Bedrooms)" />
                <div className="flex gap-2">
                  <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Item (e.g. Doors)"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
                  <Button type="button" variant="outline" onClick={addItem}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Leave section blank for an ungrouped item.</p>
            </div>

            {Object.keys(grouped).length > 0 && (
              <div className="space-y-3">
                {Object.entries(grouped).map(([section, sectionItems]) => (
                  <div key={section}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{section}</p>
                    <div className="space-y-1">
                      {sectionItems.map((item, i) => {
                        const globalIdx = items.indexOf(item);
                        return (
                          <div key={i} className="flex items-center justify-between rounded-md border px-2 py-1.5 text-sm">
                            <span>{item.label}</span>
                            <Button type="button" size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => removeItem(globalIdx)}>
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be removed. This won't affect inspections that already used it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
