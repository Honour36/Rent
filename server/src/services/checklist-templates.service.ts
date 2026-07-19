import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }
}

export const ChecklistTemplateItemSchema = z.object({
  section: z.string().max(100).optional(),
  label: z.string().min(1),
});

export const CreateChecklistTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(500).optional(),
  items: z.array(ChecklistTemplateItemSchema).min(1, 'Add at least one checklist item.'),
});
export type CreateChecklistTemplateDto = z.infer<typeof CreateChecklistTemplateSchema>;

class ChecklistTemplatesService {
  async create(data: CreateChecklistTemplateDto, user: TokenPayload) {
    return prisma.$transaction(async (tx) => {
      const template = await tx.checklistTemplate.create({
        data: { account_id: user.accountId, name: data.name, description: data.description ?? null },
      });
      await tx.checklistTemplateItem.createMany({
        data: data.items.map((item, idx) => ({
          template_id: template.id,
          section: item.section ?? null,
          label: item.label,
          sort_order: idx,
        })),
      });
      return template;
    });
  }

  async update(id: string, data: CreateChecklistTemplateDto, user: TokenPayload) {
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, account_id: user.accountId } });
    if (!existing) throw new AppError('Checklist template not found', 404);

    return prisma.$transaction(async (tx) => {
      await tx.checklistTemplate.update({
        where: { id },
        data: { name: data.name, description: data.description ?? null },
      });
      await tx.checklistTemplateItem.deleteMany({ where: { template_id: id } });
      await tx.checklistTemplateItem.createMany({
        data: data.items.map((item, idx) => ({
          template_id: id,
          section: item.section ?? null,
          label: item.label,
          sort_order: idx,
        })),
      });
      return tx.checklistTemplate.findUnique({ where: { id }, include: { items: { orderBy: { sort_order: 'asc' } } } });
    });
  }

  async list(user: TokenPayload) {
    return prisma.checklistTemplate.findMany({
      where: { account_id: user.accountId },
      orderBy: { created_at: 'desc' },
      include: { items: { orderBy: { sort_order: 'asc' } } },
    });
  }

  async getById(id: string, user: TokenPayload) {
    const template = await prisma.checklistTemplate.findFirst({
      where: { id, account_id: user.accountId },
      include: { items: { orderBy: { sort_order: 'asc' } } },
    });
    if (!template) throw new AppError('Checklist template not found', 404);
    return template;
  }

  async delete(id: string, user: TokenPayload) {
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, account_id: user.accountId } });
    if (!existing) throw new AppError('Checklist template not found', 404);
    await prisma.$transaction([
      prisma.checklistTemplateItem.deleteMany({ where: { template_id: id } }),
      prisma.checklistTemplate.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  async generatePdf(id: string, user: TokenPayload): Promise<Buffer> {
    const template = await this.getById(id, user);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const W = doc.page.width - 100;
      const DARK = '#111827';
      const GRAY = '#6b7280';
      const LINE = '#e5e7eb';
      const BLUE = '#2563eb';

      doc.fillColor(DARK).fontSize(20).font('Helvetica-Bold').text('Property Inspection Checklist', 50, 50);
      doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(template.name, 50, 76);
      if (template.description) doc.text(template.description, 50, 90);
      doc.moveTo(50, 112).lineTo(50 + W, 112).strokeColor(BLUE).lineWidth(2).stroke();

      let y = 128;
      const fieldW = W / 4 - 10;
      const fields = ['Property', 'Inspection Date', 'Inspector', 'Tenant Name'];
      fields.forEach((label, i) => {
        const x = 50 + i * (fieldW + 13);
        doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(label, x, y);
        doc.moveTo(x, y + 26).lineTo(x + fieldW, y + 26).strokeColor(LINE).lineWidth(1).stroke();
      });
      y += 50;

      doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Condition codes:', 50, y);
      doc.font('Helvetica').fontSize(9).fillColor(GRAY)
        .text('OK = Good     A = Needs Attention     X = Damaged     M = Missing', 140, y);
      y += 24;

      const sections = new Map<string, string[]>();
      for (const item of template.items) {
        const key = item.section?.trim() || 'Checklist';
        if (!sections.has(key)) sections.set(key, []);
        sections.get(key)!.push(item.label);
      }

      for (const [section, labels] of sections) {
        if (y > doc.page.height - 100) { doc.addPage(); y = 50; }

        doc.rect(50, y, W, 20).fill(BLUE);
        doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(section.toUpperCase(), 58, y + 5);
        y += 28;

        doc.fillColor(GRAY).fontSize(8).font('Helvetica-Bold')
          .text('ITEM', 66, y).text('CONDITION', 50 + W * 0.55, y).text('NOTES', 50 + W * 0.78, y);
        y += 14;

        for (const label of labels) {
          if (y > doc.page.height - 60) { doc.addPage(); y = 50; }
          doc.rect(50, y, 10, 10).strokeColor(LINE).lineWidth(1).stroke();
          doc.fillColor(DARK).fontSize(10).font('Helvetica').text(label, 66, y - 1, { width: W * 0.5 });
          doc.rect(50 + W * 0.55, y - 2, W * 0.2, 14).strokeColor(LINE).stroke();
          doc.rect(50 + W * 0.78, y - 2, W * 0.22, 14).strokeColor(LINE).stroke();
          y += 20;
        }
        y += 10;
      }

      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
        .text(`Generated ${new Date().toLocaleString('en-GB')}`, 50, doc.page.height - 40, { width: W, align: 'center' });

      doc.end();
    });
  }
}

export const checklistTemplatesService = new ChecklistTemplatesService();
