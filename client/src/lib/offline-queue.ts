import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PaymentPayload {
  tenancyId: string;
  periodMonth: number;
  periodYear: number;
  amountPaid: number;
  currency: string;
  zigUsdRate?: number;
  method: string;
  reference?: string;
  paymentDate: string;
}

interface OfflinePaymentQueue extends DBSchema {
  payments: {
    key: number;
    value: {
      id?: number;
      payload: PaymentPayload;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

const DB_NAME = 'rent-offline-db';
const STORE_NAME = 'payments';

let dbPromise: Promise<IDBPDatabase<OfflinePaymentQueue>> | null = null;

export const initDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<OfflinePaymentQueue>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const queuePayment = async (payload: PaymentPayload): Promise<void> => {
  const db = await initDB();
  if (!db) return;

  await db.add(STORE_NAME, {
    payload,
    timestamp: Date.now(),
  });
};

export const getQueuedPayments = async () => {
  const db = await initDB();
  if (!db) return [];

  return await db.getAllFromIndex(STORE_NAME, 'by-timestamp');
};

export const deleteQueuedPayment = async (id: number) => {
  const db = await initDB();
  if (!db) return;

  await db.delete(STORE_NAME, id);
};

export const clearQueue = async () => {
  const db = await initDB();
  if (!db) return;

  await db.clear(STORE_NAME);
};
