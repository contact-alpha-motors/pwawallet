import { openDB, DBSchema } from 'idb';

const DB_NAME = 'mon-portefeuille-db';
const DB_VERSION = 1;
const PENDING_STORE_NAME = 'pending-transactions';

interface PendingTransaction {
  id: string;
  type: 'add' | 'delete';
  payload: any;
}

interface MyDB extends DBSchema {
  [PENDING_STORE_NAME]: {
    key: string;
    value: PendingTransaction;
  };
}

async function getDB() {
  return openDB<MyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PENDING_STORE_NAME)) {
        db.createObjectStore(PENDING_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function addPendingTransaction(transaction: PendingTransaction) {
  const db = await getDB();
  await db.put(PENDING_STORE_NAME, transaction);
}

export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  const db = await getDB();
  return db.getAll(PENDING_STORE_NAME);
}

export async function clearPendingTransactions() {
  const db = await getDB();
  await db.clear(PENDING_STORE_NAME);
}

// Function to trigger a background sync
export async function triggerSync() {
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-transactions');
        console.log('Background sync registered');
    } catch (error) {
        console.error('Background sync registration failed:', error);
    }
}
