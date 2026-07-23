"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { toast } from "sonner";
import { useSettings, Template } from "@/hooks/useSettings";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSearchParams, useRouter } from "next/navigation";

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
import { Pencil, Trash2, Plus, CheckCircle2, Zap, Upload, Loader2 } from "@/components/icons";
import { SUBSCRIPTION_TIERS, getTierByKey, TRIAL_DAYS } from "@/config/subscription-tiers";
import { Badge } from "@/components/ui/badge";

function SettingsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "account";
  const user = useCurrentUser();
  const { account, templates, loading, updateAccount, createTemplate, updateTemplate, deleteTemplate } = useSettings();
  
  // Account Form State
  const [accountName, setAccountName] = useState("");
  const [managementFee, setManagementFee] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companySuburb, setCompanySuburb] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  // Logo Upload State
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Template Dialog State
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateChannel, setTemplateChannel] = useState<"email" | "whatsapp">("email");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard/overview');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
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
      management_fee_pct: managementFee ? parseFloat(managementFee) : undefined,
      address: companyAddress,
      suburb: companySuburb,
      city: companyCity,
      phone: companyPhone,
      email: companyEmail,
      vat_number: vatNumber,
      bank_name: bankName,
      bank_account: bankAccount,
    });
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || !account) return;

    setLogoError("");
    setLogoUploading(true);
    try {
      // Multipart uploads must bypass apiClient - it always JSON.stringifies
      // `data`, which would corrupt a FormData body (see api-client.ts and
      // the same workaround in app/application/[token]/page.tsx).
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "branding");
      formData.append("path", `branding/${account.id}/logo-${Date.now()}-${file.name}`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/storage/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setLogoError(json.error || "Logo upload failed.");
        return;
      }
      await updateAccount({ logo_url: json.data.publicUrl });
    } catch {
      setLogoError("Network error while uploading logo.");
    } finally {
      setLogoUploading(false);
    }
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
        </TabsList>

        <TabsContent value="account">
          <Card>
            <form onSubmit={handleUpdateAccount}>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  These details appear on every payment receipt. Fields marked <span className="text-destructive">*</span> are required to generate receipts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
                  ⚠ Receipts cannot be printed until Address, Phone and Email are filled in.
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Branding</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                      {account?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={account.logo_url} alt="Company logo" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No logo</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={handleLogoSelected}
                      />
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 w-fit"
                        onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
                        {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {logoUploading ? "Uploading…" : account?.logo_url ? "Replace Logo" : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP. Appears on receipts, statements, leases, and application forms.</p>
                      {logoError && <p className="text-xs text-destructive">{logoError}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Company Information</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2 grid gap-2">
                      <Label htmlFor="companyName">Company / Agency Name <span className="text-destructive">*</span></Label>
                      <Input id="companyName" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. Your Company Name" required />
                    </div>
                    <div className="sm:col-span-2 grid gap-2">
                      <Label htmlFor="companyAddress">Street Address <span className="text-destructive">*</span></Label>
                      <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="56 Edmonds Avenue" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companySuburb">Suburb</Label>
                      <Input id="companySuburb" value={companySuburb} onChange={(e) => setCompanySuburb(e.target.value)} placeholder="Belvedere" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyCity">City</Label>
                      <Input id="companyCity" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} placeholder="Harare" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="companyPhone">Phone <span className="text-destructive">*</span></Label>
                      <Input id="companyPhone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+263 242 700 300" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyEmail">Email <span className="text-destructive">*</span></Label>
                      <Input id="companyEmail" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="info@yourcompany.co.zw" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input id="vatNumber" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder="e.g. 10022800" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fee">Management Fee (%)</Label>
                      <Input id="fee" type="number" step="0.01" min="0" max="100" value={managementFee} onChange={(e) => setManagementFee(e.target.value)} placeholder="e.g. 15" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Bank Details (shown on receipt)</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="bankName">Bank / Account Name</Label>
                      <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Your Bank" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input id="bankAccount" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="ZWG 6110157970480" />
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter>
                <Button type="submit">Save Account Details</Button>
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
                  {account?.subscription_tier ?? "basic"}
                </Badge>
                {" "}- contact support to upgrade.
              </p>
              {account?.is_trialing ? (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                  <Zap className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    You're in your {TRIAL_DAYS}-day free trial —{" "}
                    <strong>{account.trial_days_left} day{account.trial_days_left === 1 ? "" : "s"} left</strong>.
                    Billing starts automatically from month two.
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Every plan includes a {TRIAL_DAYS}-day free trial for new accounts - billing starts from the second month.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SUBSCRIPTION_TIERS.map((tier) => {
                const isCurrent = (account?.subscription_tier ?? "basic") === tier.key;
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
                      <p className="text-xs text-primary font-medium mt-0.5">Free for {TRIAL_DAYS} days, then billed monthly</p>
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
                          onClick={() => window.open("mailto:support@rental.app?subject=Upgrade to " + tier.name, "_blank")}
                        >
                          {`Start Free Trial - ${tier.name}`}
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
                          <TableHead key={t.key} className={t.key === (account?.subscription_tier ?? "basic") ? "font-bold text-primary" : ""}>
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
