import { prisma } from '../db/prisma';
import { cacheGet, cacheSet } from '../db/redis';
import { reportsService } from './reports.service';

export class DashboardService {
  async getOverview(accountId: string) {
    const cacheKey = `dashboard:overview:${accountId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 1. Total Units, Occupied, Vacant
    const units = await prisma.unit.findMany({
      where: { account_id: accountId },
      select: { status: true }
    });
    
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const vacantUnits = units.filter(u => u.status === 'vacant').length;
    const maintenanceUnits = units.filter(u => u.status === 'maintenance').length;

    // 1b. Payments recorded this calendar month (replaces the Total Units KPI
    // card on the Overview page - "Total Units" duplicated info already
    // shown on the Properties page, whereas payment activity is the number
    // agents actually want to see at a glance here).
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const paymentsThisMonth = await prisma.payment.findMany({
      where: { account_id: accountId, payment_date: { gte: monthStart, lt: monthEnd } },
      select: { amount_paid: true, currency: true },
    });
    const paymentsThisMonthCount = paymentsThisMonth.length;
    // Only USD is summed for the headline figure - ZiG payments are tracked
    // separately elsewhere (e.g. the ZiG/USD rate on each payment) and mixing
    // currencies into one total would be misleading.
    const paymentsThisMonthAmount = paymentsThisMonth
      .filter(p => p.currency === 'USD')
      .reduce((sum, p) => sum + Number(p.amount_paid), 0);

    // 2. Arrears
    const arrearsReport = await reportsService.getArrearsReport(accountId);
    const arrearsCount = arrearsReport.length;
    const arrearsAmount = arrearsReport.reduce((sum, a) => sum + Number(a.amountOwed), 0);

    // 3. Collection Rate (Current Month) and 6-month chart
    const collectionRates = await reportsService.getCollectionRateReport(accountId);
    // collectionRates returns 6 months, where the first element (index 0) is the current month
    const currentMonthRate = collectionRates[0]?.rate || 0;
    
    // Sort for charting (oldest to newest)
    const chartData = [...collectionRates].reverse().map(c => ({
      name: `${c.month}/${c.year}`,
      due: c.due,
      collected: c.collected,
    }));

    // 4. Lease Expiry Alerts
    const expiringLeases = await reportsService.getLeaseExpiryReport(accountId, 30);

    // 5. Maintenance Alerts
    const maintenanceAlerts = await prisma.maintenanceRequest.findMany({
      where: {
        account_id: accountId,
        status: { in: ['open', 'in_progress'] },
        priority: { in: ['high', 'emergency'] },
      },
      include: {
        unit: { include: { property: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const mappedMaintenanceAlerts = maintenanceAlerts.map(m => ({
      id: m.id,
      title: m.title,
      priority: m.priority,
      status: m.status,
      unitNumber: m.unit.unit_number,
      propertyName: m.unit.property.name,
      createdAt: m.created_at
    }));

    // 6. Recent Payments
    const recentPayments = await prisma.payment.findMany({
      where: { account_id: accountId },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: { include: { property: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    const mappedRecentPayments = recentPayments.map(p => ({
      id: p.id,
      amount: Number(p.amount_paid),
      currency: p.currency,
      date: p.payment_date,
      status: p.status,
      tenantName: p.tenancy.tenant.full_name,
      propertyName: p.tenancy.unit.property.name,
      unitNumber: p.tenancy.unit.unit_number,
    }));

    const overviewData = {
      kpis: {
        totalUnits,
        occupiedUnits,
        vacantUnits,
        maintenanceUnits,
        arrearsCount,
        arrearsAmount,
        currentMonthRate,
        paymentsThisMonthCount,
        paymentsThisMonthAmount,
      },
      chartData,
      arrearsTable: arrearsReport.slice(0, 5), // top 5 arrears
      expiringLeases,
      maintenanceAlerts: mappedMaintenanceAlerts,
      recentPayments: mappedRecentPayments,
    };

    // Cache for 5 minutes (300 seconds)
    await cacheSet(cacheKey, 300, JSON.stringify(overviewData));

    return overviewData;
  }
}

export const dashboardService = new DashboardService();
