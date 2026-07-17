import { prisma } from '../db/prisma';
import { Resend } from 'resend';

export class RemindersService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
  }

  async sendRentReminder(tenancyId: string, daysUntilDue: number) {
    const tenancy = await prisma.tenancy.findUnique({
      where: { id: tenancyId },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!tenancy) {
      console.warn(`[RemindersService] Tenancy ${tenancyId} not found.`);
      return;
    }

    if (!tenancy.tenant.email) {
      console.warn(`[RemindersService] Tenant ${tenancy.tenant_id} has no email. Skipping reminder.`);
      return;
    }

    const { tenant, unit } = tenancy;
    const property = unit.property;
    const isFinalReminder = daysUntilDue <= 1;
    const subject = isFinalReminder 
      ? `Final Reminder: Rent due tomorrow for ${property.name}, Unit ${unit.unit_number}`
      : `Reminder: Rent due in ${daysUntilDue} days for ${property.name}, Unit ${unit.unit_number}`;
      
    const html = `
      <p>Dear ${tenant.full_name},</p>
      <p>This is a friendly reminder that your rent for <strong>${property.name}, Unit ${unit.unit_number}</strong> is due in ${daysUntilDue} days.</p>
      <p>Rent Amount: ${tenancy.currency} ${tenancy.rent_amount}</p>
      <p>Please ensure payment is made promptly to avoid any late fees.</p>
      <p>Thank you,</p>
      <p>Rental</p>
    `;

    try {
      const result = await this.resend.emails.send({
        from: 'Rental <onboarding@resend.dev>',
        to: [tenant.email as string],
        subject,
        html,
      });
      if (result.error) {
        // Resend resolves with an `error` field instead of throwing - without
        // this check a failed send fell through to "success" below.
        throw new Error(result.error.message);
      }

      await prisma.communication.create({
        data: {
          account_id: tenancy.account_id,
          tenant_id: tenant.id,
          channel: 'email',
          direction: 'outbound',
          subject,
          body: `Automated rent reminder sent (${daysUntilDue} days until due).`,
          sent_at: new Date(),
        },
      });

      console.log(`[RemindersService] Reminder sent to ${tenant.email} for tenancy ${tenancy.id}`);
    } catch (err: any) {
      console.error(`[RemindersService] Failed to send reminder for tenancy ${tenancy.id}:`, err);
    }
  }
}

export const remindersService = new RemindersService();
