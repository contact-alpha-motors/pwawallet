/// <reference lib="webworker" />

import { openDB } from 'idb';

declare const self: ServiceWorkerGlobalScope;

const DB_NAME = 'mon-portefeuille-db';
const DB_VERSION = 1;
const PENDING_STORE_NAME = 'pending-transactions';

async function getDB() {
    return openDB(DB_NAME, DB_VERSION);
}

async function syncTransactions() {
    console.log('Service Worker: Sync event triggered');
    try {
        const db = await getDB();
        const pendingTxs = await db.getAll(PENDING_STORE_NAME);
        
        if (pendingTxs.length === 0) {
            console.log('Service Worker: No pending transactions to sync.');
            return;
        }

        console.log('Service Worker: Syncing pending transactions...', pendingTxs);

        // This is where you would typically send the data to a server API.
        // Since this app uses localStorage, we will simulate a "sync" by
        // applying the changes to localStorage.
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pendingTxs),
        });

        if (response.ok) {
            console.log('Service Worker: Sync successful, clearing pending transactions.');
            await db.clear(PENDING_STORE_NAME);
            
            // Notify clients to refresh their data
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
            });

        } else {
            console.error('Service Worker: Sync failed, server returned error.', response.status, response.statusText);
        }

    } catch (error) {
        console.error('Service Worker: Error during sync:', error);
    }
}


self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transactions') {
        console.log('Service Worker: Received sync event for sync-transactions.');
        event.waitUntil(syncTransactions());
    }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// The following is boilerplate from next-pwa to ensure it works correctly.
// You can add your own logic above this line.
const MANIFEST = self.__WB_MANIFEST;
