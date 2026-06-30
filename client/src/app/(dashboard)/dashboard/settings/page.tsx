"use client";

import { useState } from "react";
import { useSettings, Template } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/auth.store";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { account, templates, loading, updateAccount, createTemplate, updateTemplate, deleteTemplate } = useSettings();
  
  // Account Form State
  const [accountName, setAccountName] = useState("");
  const [managementFee, setManagementFee] = useState("");
  
  // Template Dialog State
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateChannel, setTemplateChannel] = useState<"email" | "whatsapp">("email");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  if (user?.role !== 'admin') {
    redirect('/dashboard/overview');
  }

  // Populate account form when loaded
  if (!loading && account && accountName === "" && account.name) {
    setAccountName(account.name);
    setManagementFee(account.management_fee_pct?.toString() || "");
  }

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAccount({
      name: accountName,
      management_fee_pct: managementFee ? parseFloat(managementFee) : null as any
    });
  };

  const handleOpenTemplateDialog = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setTemplateChannel(template.channel);
      setTemplateSubject(template.subject || "");
      setTemplateBody(template.body);
    } else {
      setEditingTemplate(null);
      setTemplateName("");
      setTemplateChannel("email");
      setTemplateSubject("");
      setTemplateBody("");
    }
    setIsTemplateOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: templateName,
      channel: templateChannel,
      subject: templateChannel === "email" ? templateSubject : null,
      body: templateBody
    };

    let success = false;
    if (editingTemplate) {
      success = await updateTemplate(editingTemplate.id, data);
    } else {
      success = await createTemplate(data);
    }

    if (success) {
      setIsTemplateOpen(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and templates.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <form onSubmit={handleUpdateAccount}>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Update your company information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Acme Properties"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fee">Default Management Fee (%)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={managementFee}
                    onChange={(e) => setManagementFee(e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>
                  Manage email and WhatsApp templates for communications.
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenTemplateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No templates found.</TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell className="capitalize">{template.channel}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenTemplateDialog(template)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                View your current subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Current Tier: <strong>{account?.subscription_tier || 'Free'}</strong></p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Upload your company logo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-w-sm">
                <Label>Logo URL</Label>
                <Input value={account?.logo_url || ''} readOnly placeholder="Not set" />
                <p className="text-sm text-muted-foreground mt-2">Logo upload via Storage is pending implementation.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>
              Create or edit a message template. Use variables like {'{tenant_name}'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTemplate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tpl-name">Template Name</Label>
                <Input
                  id="tpl-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Rent Reminder"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tpl-channel">Channel</Label>
                <Select value={templateChannel} onValueChange={(val: any) => setTemplateChannel(val)}>
                  <SelectTrigger id="tpl-channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {templateChannel === "email" && (
                <div className="grid gap-2">
                  <Label htmlFor="tpl-subject">Subject</Label>
                  <Input
                    id="tpl-subject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="e.g. Important Notice"
                    required
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="tpl-body">Message Body</Label>
                <Textarea
                  id="tpl-body"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Hello {tenant_name}, your rent is due..."
                  className="min-h-[150px]"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
