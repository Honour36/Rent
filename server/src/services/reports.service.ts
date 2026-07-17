import { z } from 'zod';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import { uploadFile, getSignedUrl, BUCKETS } from '../db/storage';

export const GenerateStatementSchema = z.object({
  ownerId: z.string().uuid(),
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2000).max(2100),
});

export type GenerateStatementDto = z.infer<typeof GenerateStatementSchema>;

class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export interface StatementData {
  owner: {
    id: string;
    full_name: string;
    email: string | null;
    bank_name: string | null;
    bank_account: string | null;
  };
  period: { month: number; year: number };
  properties: PropertyStatementLine[];
  totals: {
    rentDue: number;
    rentCollected: number;
    managementFee: number;
    maintenanceCosts: number;
    trustBalance: number;
    netPayable: number;
    currency: string;
  };
  statementId: string;
  status: string;
}

interface PropertyStatementLine {
  propertyId: string;
  propertyName: string;
  units: UnitStatementLine[];
  subtotalRentDue: number;
  subtotalCollected: number;
}

interface UnitStatementLine {
  unitNumber: string;
  tenantName: string | null;
  rentDue: number;
  amountCollected: number;
  status: string;
  currency: string;
}

export class ReportsService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
  }

  async generateStatement(data: GenerateStatementDto, user: TokenPayload): Promise<StatementData> {
    const owner = await prisma.owner.findFirst({
      where: { id: data.ownerId, account_id: user.accountId },
      include: { properties: { include: { units: true } } },
    });
    if (!owner) throw new AppError('Owner not found', 404);

    const account = await prisma.account.findFirst({
      where: { id: user.accountId },
      select: { management_fee_pct: true },
    });

    const managementFeePct = account?.management_fee_pct ? Number(account.management_fee_pct) : 10;

    const propertyLines: PropertyStatementLine[] = [];
    let totalRentDue = 0;
    let totalCollected = 0;
    let totalMaintenanceCosts = 0;

    for (const property of owner.properties) {
      const unitLines: UnitStatementLine[] = [];
      let subRentDue = 0;
      let subCollected = 0;

      for (const unit of property.units) {
        const activeTenancy = await prisma.tenancy.findFirst({
          where: {
            unit_id: unit.id,
            account_id: user.accountId,
            status: 'active',
          },
          include: { tenant: true },
        });

        if (!activeTenancy) continue;

        const rentDue = Number(activeTenancy.rent_amount);
        const currency = activeTenancy.currency;

        const payment = await prisma.payment.findFirst({
          where: {
            tenancy_id: activeTenancy.id,
            period_month: data.periodMonth,
            period_year: data.periodYear,
            account_id: user.accountId,
          },
          orderBy: { created_at: 'desc' },
        });

        const amountCollected = payment ? Number(payment.amount_paid) : 0;

        unitLines.push({
          unitNumber: unit.unit_number,
          tenantName: activeTenancy.tenant.full_name,
          rentDue,
          amountCollected,
          status: payment?.status ?? 'unpaid',
          currency,
        });

        subRentDue += rentDue;
        subCollected += amountCollected;
      }

      if (unitLines.length > 0) {
        propertyLines.push({
          propertyId: property.id,
          propertyName: property.name,
          units: unitLines,
          subtotalRentDue: subRentDue,
          subtotalCollected: subCollected,
        });
        totalRentDue += subRentDue;
        totalCollected += subCollected;
      }

      // Maintenance costs for this property this period
      const startOfMonth = new Date(data.periodYear, data.periodMonth - 1, 1);
      const endOfMonth = new Date(data.periodYear, data.periodMonth, 0, 23, 59, 59);
      const maintenanceRequests = await prisma.maintenanceRequest.findMany({
        where: {
          account_id: user.accountId,
          unit_id: { in: property.units.map((u) => u.id) },
          status: { in: ['resolved', 'closed'] },
          resolved_at: { gte: startOfMonth, lte: endOfMonth },
          cost: { not: null },
        },
        select: { cost: true },
      });
      for (const req of maintenanceRequests) {
        if (req.cost) totalMaintenanceCosts += Number(req.cost);
      }
    }

    const managementFee = (totalCollected * managementFeePct) / 100;

    // Trust balance: sum of deposits held for this owner's tenancies
    const trustTxns = await prisma.trustTransaction.findMany({
      where: {
        owner_id: owner.id,
        account_id: user.accountId,
      },
      select: { type: true, amount: true },
    });
    let trustBalance = 0;
    for (const t of trustTxns) {
      if (t.type === 'deposit_received') trustBalance += Number(t.amount);
      if (t.type === 'deposit_released' || t.type === 'deduction') trustBalance -= Number(t.amount);
    }

    const netPayable = totalCollected - managementFee - totalMaintenanceCosts;

    // Create or upsert the statement record
    const existing = await prisma.ownerStatement.findFirst({
      where: {
        owner_id: owner.id,
        account_id: user.accountId,
        period_month: data.periodMonth,
        period_year: data.periodYear,
      },
    });

    let statement;
    if (existing) {
      statement = await prisma.ownerStatement.update({
        where: { id: existing.id },
        data: { status: 'draft' },
      });
    } else {
      statement = await prisma.ownerStatement.create({
        data: {
          account_id: user.accountId,
          owner_id: owner.id,
          period_month: data.periodMonth,
          period_year: data.periodYear,
          status: 'draft',
        },
      });
    }

    return {
      owner: {
        id: owner.id,
        full_name: owner.full_name,
        email: owner.email ?? null,
        bank_name: owner.bank_name ?? null,
        bank_account: owner.bank_account ?? null,
      },
      period: { month: data.periodMonth, year: data.periodYear },
      properties: propertyLines,
      totals: {
        rentDue: totalRentDue,
        rentCollected: totalCollected,
        managementFee,
        maintenanceCosts: totalMaintenanceCosts,
        trustBalance,
        netPayable,
        currency: 'USD',
      },
      statementId: statement.id,
      status: statement.status,
    };
  }

  async generateStatementPdf(statementId: string, user: TokenPayload): Promise<Buffer> {
    const statement = await prisma.ownerStatement.findFirst({
      where: { id: statementId, account_id: user.accountId },
      include: {
        owner: { include: { properties: { include: { units: true } } } },
        account: { select: { name: true, management_fee_pct: true } },
      },
    });
    if (!statement) throw new AppError('Statement not found', 404);

    // Re-generate the data to build the PDF
    const statementData = await this.generateStatement(
      {
        ownerId: statement.owner_id,
        periodMonth: statement.period_month,
        periodYear: statement.period_year,
      },
      user,
    );

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const monthName = new Date(statementData.period.year, statementData.period.month - 1).toLocaleString('default', {
        month: 'long',
      });

      doc.fontSize(20).text('OWNER STATEMENT', { align: 'center' });
      doc.fontSize(12).text(`${monthName} ${statementData.period.year}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`Owner: ${statementData.owner.full_name}`);
      if (statementData.owner.email) doc.fontSize(12).text(`Email: ${statementData.owner.email}`);
      doc.moveDown();

      doc.fontSize(14).text('Property Summary');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      for (const property of statementData.properties) {
        doc.fontSize(12).text(`Property: ${property.propertyName}`, { underline: true });
        for (const unit of property.units) {
          const curr = unit.currency === 'USD' ? '$' : 'ZiG ';
          doc.fontSize(10).text(
            `  Unit ${unit.unitNumber} | ${unit.tenantName ?? 'Vacant'} | Due: ${curr}${unit.rentDue.toFixed(2)} | Collected: ${curr}${unit.amountCollected.toFixed(2)} | ${unit.status}`,
          );
        }
        doc.fontSize(11).text(
          `  Subtotal - Due: $${property.subtotalRentDue.toFixed(2)} | Collected: $${property.subtotalCollected.toFixed(2)}`,
          { indent: 10 },
        );
        doc.moveDown(0.5);
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const t = statementData.totals;
      doc.fontSize(12).text(`Total Rent Due:         $${t.rentDue.toFixed(2)}`);
      doc.text(`Total Rent Collected:   $${t.rentCollected.toFixed(2)}`);
      doc.text(`Management Fee:         $${t.managementFee.toFixed(2)}`);
      doc.text(`Maintenance Deductions: $${t.maintenanceCosts.toFixed(2)}`);
      doc.text(`Trust Account Balance:  $${t.trustBalance.toFixed(2)}`);
      doc.moveDown(0.5);
      doc.fontSize(14).text(`Net Payable to Owner:   $${t.netPayable.toFixed(2)}`);

      doc.moveDown(2);
      doc.fontSize(9).fillColor('gray').text('This is a system-generated statement.', { align: 'center' });

      doc.end();
    });
  }

  async approveStatement(statementId: string, user: TokenPayload) {
    const statement = await prisma.ownerStatement.findFirst({
      where: { id: statementId, account_id: user.accountId },
    });
    if (!statement) throw new AppError('Statement not found', 404);
    if (statement.status !== 'draft') throw new AppError('Only draft statements can be approved', 400);

    return await prisma.ownerStatement.update({
      where: { id: statementId },
      data: {
        status: 'approved',
        approved_by: user.sub,
        approved_at: new Date(),
      },
    });
  }

  async dispatchStatement(statementId: string, user: TokenPayload) {
    const statement = await prisma.ownerStatement.findFirst({
      where: { id: statementId, account_id: user.accountId },
      include: { owner: true },
    });
    if (!statement) throw new AppError('Statement not found', 404);
    if (statement.status !== 'approved') throw new AppError('Only approved statements can be dispatched', 400);
    if (!statement.owner.email) throw new AppError('Owner does not have an email address on record', 400);

    const pdfBuffer = await this.generateStatementPdf(statementId, user);

    // Upload to Supabase Storage
    const storagePath = `statements/${user.accountId}/${statement.owner_id}/${statement.period_year}-${String(statement.period_month).padStart(2, '0')}.pdf`;
    await uploadFile(BUCKETS.statements, storagePath, pdfBuffer, 'application/pdf');
    await prisma.ownerStatement.update({ where: { id: statementId }, data: { pdf_url: storagePath } });

    const monthName = new Date(statement.period_year, statement.period_month - 1).toLocaleString('default', {
      month: 'long',
    });

    try {
      const result = await this.resend.emails.send({
        from: 'Rental <onboarding@resend.dev>',
        to: [statement.owner.email],
        subject: `Owner Statement - ${monthName} ${statement.period_year}`,
        html: `<p>Dear ${statement.owner.full_name},</p><p>Please find attached your owner statement for ${monthName} ${statement.period_year}.</p>`,
        attachments: [
          {
            filename: `statement-${statement.period_year}-${statement.period_month}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      if (result.error) {
        // Resend resolves with an `error` field instead of throwing.
        throw new Error(result.error.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new AppError(`Failed to send statement email: ${message}`, 500);
    }

    return await prisma.ownerStatement.update({
      where: { id: statementId },
      data: {
        status: 'dispatched',
        dispatched_at: new Date(),
      },
    });
  }

  async listStatements(ownerId: string | undefined, user: TokenPayload) {
    return await prisma.ownerStatement.findMany({
      where: {
        account_id: user.accountId,
        ...(ownerId && { owner_id: ownerId }),
      },
      include: {
        owner: { select: { id: true, full_name: true } },
        approver: { select: { id: true, full_name: true } },
      },
      orderBy: [{ period_year: 'desc' }, { period_month: 'desc' }],
    });
  }

  async getArrearsReport(accountId: string) {
    const tenancies = await prisma.tenancy.findMany({
      where: { account_id: accountId, status: 'active' },
      include: {
        tenant: true,
        unit: { include: { property: true } },
        payments: true,
      },
    });

    const report = [];
    const now = new Date();
    
    for (const t of tenancies) {
      const start = new Date(t.lease_start);
      let monthsActive = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
      if (now.getDate() < (t.rent_due_day || 1)) {
        monthsActive--;
      }
      if (monthsActive < 0) monthsActive = 0;
      
      const totalDue = monthsActive * Number(t.rent_amount);
      const totalPaid = t.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const balance = totalDue - totalPaid;
      
      if (balance > 0) {
        const monthsOwed = balance / Number(t.rent_amount);
        const earliestMonthOwed = monthsActive - monthsOwed; 
        const earliestDueDate = new Date(start.getFullYear(), start.getMonth() + Math.floor(earliestMonthOwed), t.rent_due_day || 1);
        let daysOverdue = Math.floor((now.getTime() - earliestDueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue < 0) daysOverdue = 0;

        report.push({
          tenancyId: t.id,
          tenantName: t.tenant.full_name,
          propertyName: t.unit.property.name,
          unitNumber: t.unit.unit_number,
          amountOwed: balance,
          currency: t.currency,
          daysOverdue,
        });
      }
    }
    
    return report.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  async getVacancyReport(accountId: string) {
    const units = await prisma.unit.findMany({
      where: { account_id: accountId, status: 'vacant' },
      include: {
        property: true,
        tenancies: {
          orderBy: { lease_end: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    return units.map((u) => {
      const lastTenancy = u.tenancies[0];
      let vacancyDate = lastTenancy?.lease_end ? new Date(lastTenancy.lease_end) : new Date(u.created_at);
      if (vacancyDate > now) vacancyDate = now;
      const daysVacant = Math.floor((now.getTime() - vacancyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        unitId: u.id,
        propertyName: u.property.name,
        unitNumber: u.unit_number,
        daysVacant,
        rentAmount: Number(u.rent_amount),
        currency: u.currency,
      };
    }).sort((a, b) => b.daysVacant - a.daysVacant);
  }

  async getLeaseExpiryReport(accountId: string, days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const tenancies = await prisma.tenancy.findMany({
      where: { 
        account_id: accountId, 
        status: 'active',
        lease_end: { lte: cutoffDate, not: null }
      },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
      orderBy: { lease_end: 'asc' },
    });

    return tenancies.map((t) => ({
      tenancyId: t.id,
      tenantName: t.tenant.full_name,
      propertyName: t.unit.property.name,
      unitNumber: t.unit.unit_number,
      leaseEnd: t.lease_end,
      rentAmount: Number(t.rent_amount),
      currency: t.currency,
    }));
  }

  async getCollectionRateReport(accountId: string, propertyId?: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const report = [];
    for (let i = 0; i < 6; i++) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      
      const payments = await prisma.payment.findMany({
        where: {
          account_id: accountId,
          period_month: m,
          period_year: y,
          ...(propertyId && { tenancy: { unit: { property_id: propertyId } } })
        },
      });

      const collected = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
      
      const startOfMonth = new Date(y, m - 1, 1);
      const tenancies = await prisma.tenancy.findMany({
        where: {
          account_id: accountId,
          lease_start: { lte: startOfMonth },
          ...(propertyId && { unit: { property_id: propertyId } })
        }
      });
      
      const activeTenancies = tenancies.filter(t => !t.lease_end || new Date(t.lease_end) >= startOfMonth);
      const rentDue = activeTenancies.reduce((sum, t) => sum + Number(t.rent_amount), 0);
      
      report.push({
        month: m,
        year: y,
        collected,
        due: rentDue,
        rate: rentDue > 0 ? (collected / rentDue) * 100 : 0
      });
    }
    
    return report;
  }

  async getMaintenanceReport(accountId: string) {
    const requests = await prisma.maintenanceRequest.findMany({
      where: { account_id: accountId },
      include: {
        unit: { include: { property: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return requests.map((r) => {
      let resolutionTime = null;
      if (r.resolved_at) {
        resolutionTime = Math.floor((new Date(r.resolved_at).getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24));
      }
      return {
        requestId: r.id,
        propertyName: r.unit.property.name,
        unitNumber: r.unit.unit_number,
        title: r.title,
        priority: r.priority,
        status: r.status,
        cost: r.cost ? Number(r.cost) : 0,
        loggedDate: r.created_at,
        resolutionTime,
      };
    });
  }

  async getTrustLedgerReport(accountId: string, ownerId?: string) {
    const txns = await prisma.trustTransaction.findMany({
      where: {
        account_id: accountId,
        ...(ownerId && { owner_id: ownerId }),
      },
      include: {
        owner: true,
        tenancy: { include: { tenant: true, unit: true } }
      },
      orderBy: { created_at: 'desc' },
    });

    return txns.map((t) => ({
      transactionId: t.id,
      date: t.created_at,
      ownerName: t.owner?.full_name ?? 'N/A',
      tenantName: t.tenancy?.tenant?.full_name ?? 'N/A',
      unitNumber: t.tenancy?.unit?.unit_number ?? 'N/A',
      type: t.type,
      amount: Number(t.amount),
      currency: t.currency,
      description: t.description,
    }));
  }

  /** Returns a short-lived signed URL for an already-dispatched statement PDF. */
  async getStatementSignedUrl(statementId: string, user: TokenPayload): Promise<string> {
    const statement = await prisma.ownerStatement.findFirst({
      where: { id: statementId, account_id: user.accountId },
    });
    if (!statement) throw new Error('Statement not found');
    if (!statement.pdf_url) {
      // Generate on demand if not stored yet
      const pdfBuffer = await this.generateStatementPdf(statementId, user);
      const storagePath = `statements/${user.accountId}/${statement.owner_id}/${statement.period_year}-${String(statement.period_month).padStart(2, '0')}.pdf`;
      await uploadFile(BUCKETS.statements, storagePath, pdfBuffer, 'application/pdf');
      await prisma.ownerStatement.update({ where: { id: statementId }, data: { pdf_url: storagePath } });
      return getSignedUrl(BUCKETS.statements, storagePath);
    }
    return getSignedUrl(BUCKETS.statements, statement.pdf_url);
  }
}

export const reportsService = new ReportsService();
