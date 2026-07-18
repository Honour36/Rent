import { prisma } from '../db/prisma';
import { TokenPayload } from '../middleware/auth.middleware';

export type NotificationType =
  | 'application_new'
  | 'rent_due'
  | 'rent_overdue'
  | 'maintenance_new'
  | 'lease_expiring'
  | 'unit_vacant'
  | 'payment_received'
  | 'rent_collection_scheduled';

export interface CreateNotificationInput {
  accountId: string;
  userId?: string; // specific agent, or omit to broadcast to the whole account
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}

class NotificationsService {
  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        account_id: data.accountId,
        user_id: data.userId ?? null,
        type: data.type,
        title: data.title,
        body: data.body,
        entity_type: data.entityType ?? null,
        entity_id: data.entityId ?? null,
      },
    });
  }

  async list(user: TokenPayload, limit = 30) {
    return prisma.notification.findMany({
      where: {
        account_id: user.accountId,
        OR: [{ user_id: user.sub }, { user_id: null }],
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  async markRead(id: string, user: TokenPayload) {
    return prisma.notification.updateMany({
      where: { id, account_id: user.accountId },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async markAllRead(user: TokenPayload) {
    return prisma.notification.updateMany({
      where: {
        account_id: user.accountId,
        is_read: false,
        OR: [{ user_id: user.sub }, { user_id: null }],
      },
      data: { is_read: true, read_at: new Date() },
    });
  }

  async getUnreadCount(user: TokenPayload) {
    return prisma.notification.count({
      where: {
        account_id: user.accountId,
        is_read: false,
        OR: [{ user_id: user.sub }, { user_id: null }],
      },
    });
  }
}

export const notificationsService = new NotificationsService();
