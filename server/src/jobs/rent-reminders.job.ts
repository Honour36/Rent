import cron from 'node-cron';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { remindersService } from '../services/reminders.service';

const LOCK_KEY = 'cron:rent-reminders:lock';
const LOCK_TTL = 60 * 5; // 5 minutes

export async function runRentReminders() {
  if (redis) {
    const lock = await redis.set(LOCK_KEY, 'locked', 'EX', LOCK_TTL, 'NX');
    if (!lock) {
      console.log('[Jobs] Rent reminders job is already running on another instance.');
      return;
    }
  }

  console.log('[Jobs] Starting rent reminders job...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active tenancies
    const tenancies = await prisma.tenancy.findMany({
      where: { status: 'active' },
    });

    for (const tenancy of tenancies) {
      if (!tenancy.rent_due_day) continue;

      let dueMonth = today.getMonth();
      let dueYear = today.getFullYear();

      // If today is past the due day, next due date is next month
      if (today.getDate() > tenancy.rent_due_day) {
        dueMonth += 1;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear += 1;
        }
      }

      const dueDate = new Date(dueYear, dueMonth, tenancy.rent_due_day);
      const diffTime = Math.abs(dueDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 5 || diffDays === 1) {
        const periodMonth = dueMonth + 1; // 1-indexed for the DB
        const periodYear = dueYear;

        const existingPayment = await prisma.payment.findFirst({
          where: {
            tenancy_id: tenancy.id,
            period_month: periodMonth,
            period_year: periodYear,
            status: 'paid',
          },
        });

        if (!existingPayment) {
          await remindersService.sendRentReminder(tenancy.id, diffDays);
        }
      }
    }
    console.log('[Jobs] Rent reminders job completed.');
  } catch (error) {
    console.error('[Jobs] Error running rent reminders job:', error);
  }
}

export function startRentRemindersJob() {
  cron.schedule('0 7 * * *', () => {
    runRentReminders();
  });
  console.log('[Jobs] Scheduled rent reminders job (07:00 daily).');
}
