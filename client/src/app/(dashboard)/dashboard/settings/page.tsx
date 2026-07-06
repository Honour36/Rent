"use client";

import { useState, Suspense } from "react";
import { useSettings, Template } from "@/hooks/useSettings";
import { useAuthStore } from "@/stores/auth.store";
import { useSearchParams, redirect } from "next/navigation";

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
import { Pencil, Trash2, Plus, CheckCircle2, Zap } from "lucide-react";
import { SUBSCRIPTION_TIERS, getTierByKey } from "@/config/subscription-tiers";
import { Badge } from "@/components/ui/badge";

function SettingsPageInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "account";
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

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="subscription">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Subscription Plans</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Current plan:{" "}
                <Badge variant="outline" className="ml-1 capitalize font-semibold">
                  {account?.subscription_tier ?? "free"}
                </Badge>
                {" "}— contact support to upgrade.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SUBSCRIPTION_TIERS.map((tier) => {
                const isCurrent = (account?.subscription_tier ?? "free") === tier.key;
                return (
                  <Card
                    key={tier.key}
                    className={[
                      "relative flex flex-col",
                      tier.highlighted ? "border-primary shadow-md" : "",
                      isCurrent ? "ring-2 ring-primary" : "",
                    ].join(" ")}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="px-3 py-0.5 text-xs">Most Popular</Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-3">
                        <Badge variant="secondary" className="px-2 py-0.5 text-xs flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Active
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{tier.name}</CardTitle>
                      <div className="mt-1">
                        <span className="text-3xl font-bold">${tier.priceUsd}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="text-xs mt-1">{tier.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrent ? (
                        <Button className="w-full" variant="secondary" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant={tier.highlighted ? "default" : "outline"}
                          onClick={() => window.open("mailto:support@propmanager.app?subject=Upgrade to " + tier.name, "_blank")}
                        >
                          {tier.priceUsd === 0 ? "Get Started Free" : `Upgrade to ${tier.name}`}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Plan Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        {SUBSCRIPTION_TIERS.map(t => (
                          <TableHead key={t.key} className={t.key === (account?.subscription_tier ?? "free") ? "font-bold text-primary" : ""}>
                            {t.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(["properties", "units", "agents", "owners", "storageGb"] as const).map(resource => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium capitalize">{resource === "storageGb" ? "Storage" : resource}</TableCell>
                          {SUBSCRIPTION_TIERS.map(t => (
                            <TableCell key={t.key}>
                              {t.limits[resource] === -1 ? "∞" : resource === "storageGb" ? `${t.limits[resource]} GB` : t.limits[resource]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive alerts and system messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: "rent_due", label: "Rent due reminders", desc: "Get notified when tenant rent is due in 3 days." },
                { id: "payment_received", label: "Payment received", desc: "Alert when a payment is recorded." },
                { id: "maintenance_new", label: "New maintenance request", desc: "Alert when a tenant logs a request." },
                { id: "lease_expiry", label: "Lease expiry", desc: "Notify 30 days before a lease expires." },
                { id: "application_new", label: "New application", desc: "Alert when a prospective tenant submits an application." },
              ].map(({ id, label, desc }) => (
                <div key={id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </div>
              ))}
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

export default function SettingsPage() {
  return <Suspense fallback={null}><SettingsPageInner /></Suspense>;
}
