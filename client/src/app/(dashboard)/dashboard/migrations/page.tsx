"use client";

import { useRef, useState } from "react";
import {
  Upload, Download, Loader2, CheckCircle2, AlertTriangle, X, Info, FileText,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useMigrations, MigrationField, ParsedPreview, CommitSummary,
} from "@/hooks/useMigrations";

const FIELD_LABELS: Record<MigrationField, string> = {
  property_address: "Property Address", property_suburb: "Suburb", property_city: "City", property_type: "Property Type",
  owner_name: "Owner (Lessor) Name", owner_phone: "Owner Phone", owner_email: "Owner Email",
  tenant_name: "Tenant (Lessee) Name", tenant_phone: "Tenant Phone", tenant_email: "Tenant Email",
  rent_amount: "Rent Amount", currency: "Currency",
  lease_start: "Lease Start Date", lease_end: "Lease Expiry Date", deposit_amount: "Deposit Amount",
};
const REQUIRED_FIELDS: MigrationField[] = ["property_address", "owner_name"];
const ALL_FIELDS = Object.keys(FIELD_LABELS) as MigrationField[];

type Step = "intro" | "preview" | "result";

export default function MigrationsPage() {
  const { downloadTemplate, preview, commit, uploading, uploadProgress, committing, commitProgress } = useMigrations();
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedPreview | null>(null);
  const [mapping, setMapping] = useState<Record<number, MigrationField | "none">>({});
  const [result, setResult] = useState<CommitSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File) => {
    setError("");
    const res = await preview(file);
    if (!res.success) { setError(res.error); return; }
    setParsed(res.data);
    const initialMapping: Record<number, MigrationField | "none"> = {};
    res.data.headers.forEach((_, i) => {
      initialMapping[i] = res.data.mapping[i] ?? "none";
    });
    setMapping(initialMapping);
    setStep("preview");
  };

  const handleCommit = async () => {
    if (!parsed) return;
    setError("");
    const finalMapping: Record<number, MigrationField | null> = {};
    Object.entries(mapping).forEach(([i, f]) => { finalMapping[Number(i)] = f === "none" ? null : f; });

    const mappedFields = Object.values(finalMapping);
    const missingRequired = REQUIRED_FIELDS.filter(f => !mappedFields.includes(f));
    if (missingRequired.length > 0) {
      setError(`Please map a column to: ${missingRequired.map(f => FIELD_LABELS[f]).join(", ")} before importing.`);
      return;
    }

    const res = await commit(parsed.rows, finalMapping, parsed.monthMapping, parsed.inferredYear);
    if (!res.success) { setError(res.error); return; }
    setResult(res.data);
    setStep("result");
  };

  const reset = () => {
    setParsed(null);
    setResult(null);
    setError("");
    setStep("intro");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Migrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Already tracking your properties in a spreadsheet? Upload it here instead of retyping everything by hand.
        </p>
      </div>

      {step === "intro" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How this works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>NB: Download the template and use it</AlertTitle>
                <AlertDescription>
                  Your own spreadsheet will likely still work — column matching is flexible — but starting from the template gives you the exact structure this importer is built around, including the monthly payment columns below, and avoids surprises. Download it, copy your data into it, then upload that.
                </AlertDescription>
              </Alert>

              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Upload an <strong className="text-foreground">.xlsx or .csv</strong> file — one row per property.</li>
                <li>We&apos;ll automatically detect your column headers and match them to the right fields — you can fix any that guessed wrong before anything is saved.</li>
                <li>Nothing is imported until you review the preview and confirm.</li>
                <li>Re-uploading the same (or an overlapping) spreadsheet later won&apos;t create duplicates — matching owners, properties, and tenants are reused, not cloned.</li>
              </ol>

              <div className="rounded-md border border-border p-3">
                <p className="font-medium mb-2">Columns we recognize</p>
                <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {ALL_FIELDS.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <span className={REQUIRED_FIELDS.includes(f) ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {FIELD_LABELS[f]}
                      </span>
                      {REQUIRED_FIELDS.includes(f) && <Badge variant="outline" className="text-[10px] px-1.5 py-0">required</Badge>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Column names don&apos;t need to match exactly — e.g. &quot;LESSOR&quot; or &quot;LANDLORD&quot; are both recognized as Owner Name. Commission isn&apos;t imported - it&apos;s a single account-wide rate set in Settings, not tracked per property.
                </p>
              </div>

              <div className="rounded-md border border-border p-3">
                <p className="font-medium mb-2">Monthly payment columns (JAN – DEC)</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li><Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1.5">paid</Badge>the full rent amount was paid that month</li>
                  <li><Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1.5">145</Badge>that specific amount was paid against the full rent - imported as a partial payment if it&apos;s less than the rent amount</li>
                  <li><Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1.5">(blank)</Badge>rent wasn&apos;t paid that month - this becomes an arrear, not a missing value</li>
                  <li><Badge variant="outline" className="text-[10px] px-1.5 py-0 mr-1.5">vacant</Badge>the unit had no tenant from that point on - the unit is imported as vacant</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">
                  Arrears are calculated the same way as everywhere else in Rental: blank months up to and including the current month (once its due day has passed) count as owed. A blank month that hasn&apos;t happened yet obviously isn&apos;t an arrear.
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Missing information is fine</AlertTitle>
                <AlertDescription>
                  Only a property address and an owner name are required. Everything else — rent, tenant details, lease dates — can be left blank and filled in later from the property page. We&apos;ll also remind you afterwards if anything imported is missing details worth adding.
                </AlertDescription>
              </Alert>

              <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
                <Download className="h-3.5 w-3.5" />
                Download the template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-10">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelected(f); }} />
              <div className="flex flex-col items-center gap-3 text-center">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">{uploading ? `Uploading… ${uploadProgress}%` : "Upload your spreadsheet"}</p>
                {uploading && (
                  <div className="w-full max-w-xs">
                    <Progress value={uploadProgress} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">.xlsx or .csv, up to 15MB</p>
                <Button size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {step === "preview" && parsed && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Review column mapping
              </CardTitle>
              <CardDescription>
                Found {parsed.totalRows} row{parsed.totalRows === 1 ? "" : "s"} on sheet &quot;{parsed.sheetName}&quot;. Fix any column below that was guessed wrong, or set it to &quot;Don&apos;t import&quot;.
                {Object.keys(parsed.monthMapping).length > 0 && (
                  <> Detected {Object.keys(parsed.monthMapping).length} monthly payment column{Object.keys(parsed.monthMapping).length === 1 ? "" : "s"} for {parsed.inferredYear}.</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsed.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {parsed.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Your Column</TableHead>
                      <TableHead>Maps To</TableHead>
                      <TableHead>Sample Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.headers.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{h || <span className="text-muted-foreground">(blank)</span>}</TableCell>
                        <TableCell>
                          <NativeSelect
                            value={mapping[i] ?? "none"}
                            onChange={(e) => setMapping(p => ({ ...p, [i]: e.target.value as MigrationField | "none" }))}
                            className="w-56"
                          >
                            <NativeSelectOption value="none">Don&apos;t import</NativeSelectOption>
                            {ALL_FIELDS.map(f => (
                              <NativeSelectOption key={f} value={f}>
                                {FIELD_LABELS[f]}{REQUIRED_FIELDS.includes(f) ? " *" : ""}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                          {String(parsed.rows[0]?.[i] ?? "-")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">Showing the first row as a sample. All {parsed.totalRows} rows will be processed using this mapping.</p>
            </CardContent>
          </Card>

          {committing && (
            <Card>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Importing your data…</span>
                  <span className="text-muted-foreground">{commitProgress}%</span>
                </div>
                <Progress value={commitProgress} />
                <p className="text-xs text-muted-foreground">Don&apos;t close this tab - rows already processed are saved even if you do, but you&apos;ll need to check back here for the full summary.</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} disabled={committing}>Start Over</Button>
            <Button className="gap-1.5" disabled={committing} onClick={handleCommit}>
              {committing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {committing ? `Importing… ${commitProgress}%` : `Import ${parsed.totalRows} Rows`}
            </Button>
          </div>
        </>
      )}

      {step === "result" && result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Import complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: "Owners", created: result.ownersCreated, matched: result.ownersMatched },
                  { label: "Properties", created: result.propertiesCreated, matched: result.propertiesMatched },
                  { label: "Tenants", created: result.tenantsCreated, matched: result.tenantsMatched },
                  { label: "Tenancies Created", created: result.tenanciesCreated, matched: null },
                  { label: "Payments Imported", created: result.paymentsImported, matched: null },
                ].map(s => (
                  <div key={s.label} className="rounded-md border border-border p-3">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.created}{s.matched !== null && <span className="text-sm font-normal text-muted-foreground"> new</span>}</p>
                    {s.matched !== null && s.matched > 0 && (
                      <p className="text-xs text-muted-foreground">+{s.matched} matched existing</p>
                    )}
                  </div>
                ))}
              </div>
              {result.rowsSkipped > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">{result.rowsSkipped} row{result.rowsSkipped === 1 ? "" : "s"} skipped - see details below.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Row-by-row details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.results.map((r) => (
                      <TableRow key={r.row}>
                        <TableCell className="text-muted-foreground">{r.row}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "skipped" ? "destructive" : "outline"} className="capitalize text-xs">
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p>{r.detail}</p>
                          {r.warnings.map((w, i) => (
                            <p key={i} className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="h-3 w-3 shrink-0" /> {w}
                            </p>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={reset}>
              <X className="h-3.5 w-3.5" />
              Import Another File
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
