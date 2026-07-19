import { Resend } from 'resend';
import { colors } from './base-styles';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');

/**
 * Resend's SDK resolves with `{ data, error }` on failure rather than throwing
 * (invalid API key, unverified domain, bad recipient, etc). Every call site in
 * this file used to `return resend.emails.send(...)` directly, so a failed send
 * looked identical to a successful one to the caller - this is why emails could
 * silently stop going out. Route every send through here so failures surface.
 */
async function sendEmail(payload: Parameters<typeof resend.emails.send>[0]) {
  const result = await resend.emails.send(payload);
  if (result.error) {
    console.error('Resend email failed:', result.error);
    throw new Error(result.error.message || 'Failed to send email');
  }
  return result;
}

// RESEND_FROM_EMAIL must be an address on a domain that is verified inside
// this account's Resend dashboard (Domains tab) - Resend rejects sends from
// any other domain with a "domain is not verified" error. The verified
// domain is hiprop.me. This fallback exists only for local/dev safety net -
// production should still set RESEND_FROM_EMAIL explicitly in Render.
if (!process.env.RESEND_FROM_EMAIL) {
  console.warn(
    '[email-service] RESEND_FROM_EMAIL is not set. Falling back to noreply@hiprop.me. ' +
    'Set RESEND_FROM_EMAIL in your server environment (Render → Environment) to make this explicit.'
  );
}

export function getFromAddress(accountName?: string): string {
  const name = accountName || 'Rental';
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@hiprop.me';
  return `${name} <${from}>`;
}

/** Core HTML email builder - renders a clean, branded email body */
function buildHtml(opts: {
  title: string;
  preheader?: string;
  body: string;
  accentColor?: string;
  logoText?: string;
}): string {
  const accent = opts.accentColor || colors.primary;
  const logo = opts.logoText || 'Rental';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${opts.title}</title>
<style>
  body { margin:0; padding:0; background:#f3f4f6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
  .wrapper { background:#f3f4f6; padding:32px 16px; }
  .card { background:#fff; border-radius:12px; max-width:540px; margin:0 auto; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.08); }
  .header { background:${accent}; padding:28px 32px; text-align:center; }
  .header-logo { color:#fff; font-size:28px; font-weight:800; letter-spacing:-0.5px; margin:0; }
  .header-sub { color:rgba(255,255,255,.8); font-size:13px; margin:4px 0 0; }
  .body { padding:32px; }
  .body h1 { font-size:22px; font-weight:700; color:#111827; margin:0 0 8px; }
  .body p { font-size:15px; color:#374151; line-height:1.6; margin:0 0 16px; }
  .otp-box { background:#f9fafb; border:2px solid ${accent}; border-radius:10px; padding:20px; text-align:center; margin:24px 0; }
  .otp-code { font-size:38px; font-weight:800; letter-spacing:8px; color:${accent}; font-family:monospace; }
  .otp-label { font-size:12px; color:#6b7280; margin-top:6px; }
  .btn { display:inline-block; background:${accent}; color:#fff !important; text-decoration:none; padding:13px 32px; border-radius:8px; font-weight:600; font-size:15px; margin:8px 0; }
  .divider { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
  .info-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f3f4f6; font-size:14px; }
  .info-label { color:#6b7280; }
  .info-value { color:#111827; font-weight:500; }
  .highlight { background:#f9fafb; border-left:4px solid ${accent}; padding:14px 16px; border-radius:0 8px 8px 0; margin:16px 0; font-size:14px; color:#111827; }
  .footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center; }
  .footer p { color:#9ca3af; font-size:12px; margin:0; line-height:1.5; }
  .footer a { color:#6b7280; text-decoration:underline; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <p class="header-logo">${logo}</p>
      <p class="header-sub">Property Management Platform</p>
    </div>
    <div class="body">
      ${opts.body}
    </div>
    <div class="footer">
      <p>Rental &nbsp;·&nbsp; <a href="#">Unsubscribe</a></p>
      <p style="margin-top:4px">This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ─── VERIFICATION EMAIL ──────────────────────────────────────────────────────

export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  code: string;
  accountName?: string;
}) {
  const body = `
    <h1>Verify your email address</h1>
    <p>Hi ${opts.name}, welcome to <strong>Rental</strong> - your property management platform. To get started, enter the verification code below.</p>
    <div class="otp-box">
      <div class="otp-code">${opts.code}</div>
      <div class="otp-label">This code expires in 15 minutes</div>
    </div>
    <p style="color:#6b7280;font-size:13px">If you didn't create an account, you can safely ignore this email.</p>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `${opts.code} - your Rental verification code`,
    html: buildHtml({ title: 'Verify your email', body }),
  });
}

// ─── WELCOME EMAIL ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  accountName: string;
  dashboardUrl?: string;
}) {
  const url = opts.dashboardUrl || `${process.env.FRONTEND_URL || 'https://rent-pi-murex.vercel.app'}/dashboard/overview`;
  const body = `
    <h1>Welcome to Rental, ${opts.name}! 🎉</h1>
    <p>You've successfully set up <strong>${opts.accountName}</strong> on Rental. You're now ready to manage your property portfolio in one place.</p>
    <div class="highlight">
      <strong>Quick start checklist:</strong><br/>
      ✅ Add your first property<br/>
      ✅ Fill in your account details (needed for receipts)<br/>
      ✅ Add your owners and tenants<br/>
      ✅ Share application links with prospective tenants
    </div>
    <p>If you have any questions, reply to this email or reach out to support.</p>
    <center><a href="${url}" class="btn">Go to Dashboard →</a></center>
    <hr class="divider" />
    <p style="color:#6b7280;font-size:13px">You're receiving this because you registered at Rental.</p>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `Welcome to Rental, ${opts.name}!`,
    html: buildHtml({ title: 'Welcome to Rental', body }),
  });
}

// ─── PASSWORD RESET EMAIL ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  code: string;
  accountName?: string;
}) {
  const body = `
    <h1>Reset your password</h1>
    <p>Hi ${opts.name}, we received a request to reset your password. Use the code below to continue.</p>
    <div class="otp-box">
      <div class="otp-code">${opts.code}</div>
      <div class="otp-label">This code expires in 15 minutes</div>
    </div>
    <p style="color:#6b7280;font-size:13px">If you didn't request a password reset, please ignore this email - your account is safe.</p>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: 'Reset your Rental password',
    html: buildHtml({ title: 'Password reset', body }),
  });
}

// ─── RENT REMINDER EMAIL ─────────────────────────────────────────────────────

export async function sendRentReminderEmail(opts: {
  to: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  currency: string;
  dueDay: number;
  month: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  accountName: string;
}) {
  const body = `
    <h1>Rent Reminder</h1>
    <p>Dear ${opts.tenantName},</p>
    <p>This is a friendly reminder that your rent payment is due on the <strong>${opts.dueDay}${ordinal(opts.dueDay)}</strong> of this month.</p>
    <div class="info-row"><span class="info-label">Property</span><span class="info-value">${opts.propertyName}</span></div>
    <div class="info-row"><span class="info-label">Unit</span><span class="info-value">${opts.unitNumber}</span></div>
    <div class="info-row"><span class="info-label">Amount Due</span><span class="info-value" style="font-size:18px;font-weight:700">${opts.currency} ${opts.rentAmount.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}</span></div>
    <div class="info-row"><span class="info-label">Period</span><span class="info-value">${opts.month}</span></div>
    <hr class="divider" />
    <p>Please arrange payment and retain your receipt. If you have already paid, please disregard this notice.</p>
    <p>Contact your agent if you have any questions:</p>
    <div class="highlight">
      <strong>${opts.agentName}</strong><br/>
      📧 ${opts.agentEmail}<br/>
      ${opts.agentPhone ? `📱 ${opts.agentPhone}` : ''}
    </div>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `Rent Reminder - ${opts.currency} ${opts.rentAmount.toLocaleString()} due ${opts.dueDay}${ordinal(opts.dueDay)}`,
    html: buildHtml({ title: 'Rent Reminder', body }),
  });
}

// ─── RENT OVERDUE EMAIL ──────────────────────────────────────────────────────

export async function sendRentOverdueEmail(opts: {
  to: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  rentAmount: number;
  currency: string;
  daysOverdue: number;
  accountName: string;
  agentName: string;
  agentEmail: string;
}) {
  const body = `
    <h1>Overdue Rent Notice</h1>
    <p>Dear ${opts.tenantName},</p>
    <p>Our records show that your rent payment for <strong>${opts.propertyName} - ${opts.unitNumber}</strong> is now <strong>${opts.daysOverdue} day${opts.daysOverdue !== 1 ? 's' : ''} overdue</strong>.</p>
    <div class="info-row"><span class="info-label">Amount Overdue</span><span class="info-value" style="font-weight:700;font-size:18px">${opts.currency} ${opts.rentAmount.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}</span></div>
    <p>Please contact your agent immediately to arrange payment and avoid further action.</p>
    <div class="highlight" style="border-left-color:#111827;background:#f3f4f6;color:#111827">
      <strong>${opts.agentName}</strong><br/>📧 ${opts.agentEmail}
    </div>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `OVERDUE: Rent payment ${opts.currency} ${opts.rentAmount.toLocaleString()} - ${opts.propertyName}`,
    html: buildHtml({ title: 'Overdue Notice', body }),
  });
}

// ─── OWNER PAYMENT NOTIFICATION ──────────────────────────────────────────────

export async function sendOwnerPaymentNotification(opts: {
  to: string;
  ownerName: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  currency: string;
  receiptNumber: string;
  paymentDate: string;
  accountName: string;
  collectionLink?: string;
}) {
  const body = `
    <h1>Payment Received</h1>
    <p>Dear ${opts.ownerName},</p>
    <p>A rent payment has been received and recorded for your property.</p>
    <div class="info-row"><span class="info-label">Property</span><span class="info-value">${opts.propertyName} - ${opts.unitNumber}</span></div>
    <div class="info-row"><span class="info-label">Tenant</span><span class="info-value">${opts.tenantName}</span></div>
    <div class="info-row"><span class="info-label">Amount</span><span class="info-value" style="font-weight:700;font-size:18px">${opts.currency} ${opts.amount.toLocaleString('en-ZW', { minimumFractionDigits: 2 })}</span></div>
    <div class="info-row"><span class="info-label">Receipt</span><span class="info-value">${opts.receiptNumber}</span></div>
    <div class="info-row"><span class="info-label">Date</span><span class="info-value">${opts.paymentDate}</span></div>
    <hr class="divider" />
    ${opts.collectionLink ? `
    <p>When would you like to collect this rent?</p>
    <p style="text-align:center;margin:20px 0">
      <a href="${opts.collectionLink}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Choose collection date &amp; time</a>
    </p>
    <p style="color:#6b7280;font-size:13px">This link can only be used once, and expires as soon as you submit a date.</p>
    <hr class="divider" />
    ` : ''}
    <p style="color:#6b7280;font-size:13px">Your agent will include this in your monthly statement.</p>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `Payment received - ${opts.currency} ${opts.amount.toLocaleString()} for ${opts.propertyName}`,
    html: buildHtml({ title: 'Payment Received', body }),
  });
}

// ─── APPLICATION RECEIVED EMAIL (to agent) ───────────────────────────────────

export async function sendApplicationReceivedEmail(opts: {
  to: string;
  agentName: string;
  applicantName: string;
  propertyName: string;
  unitNumber: string;
  applicationId: string;
  accountName: string;
}) {
  const url = `${process.env.FRONTEND_URL || 'https://rent-pi-murex.vercel.app'}/dashboard/applications/${opts.applicationId}`;
  const body = `
    <h1>New Tenant Application</h1>
    <p>Hi ${opts.agentName},</p>
    <p>A new application has been submitted for review.</p>
    <div class="info-row"><span class="info-label">Applicant</span><span class="info-value">${opts.applicantName}</span></div>
    <div class="info-row"><span class="info-label">Property</span><span class="info-value">${opts.propertyName}</span></div>
    <div class="info-row"><span class="info-label">Unit</span><span class="info-value">${opts.unitNumber}</span></div>
    <center style="margin-top:24px"><a href="${url}" class="btn">Review Application →</a></center>
  `;

  return sendEmail({
    from: getFromAddress(opts.accountName),
    to: [opts.to],
    subject: `New application from ${opts.applicantName} - ${opts.propertyName}`,
    html: buildHtml({ title: 'New Application', body }),
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

