import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, Transaction, KYCDocument, ExchangeRate, SyncItem } from '../types';
import { syncService } from '../services/syncService';
import { securityService } from '../services/securityService';

interface AppStore extends AppState {
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addKYCDocument: (document: KYCDocument) => void;
  updateKYCDocument: (id: string, updates: Partial<KYCDocument>) => void;
  setExchangeRates: (rates: ExchangeRate[]) => void;
  addToSyncQueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromSyncQueue: (id: string) => void;
  incrementSyncRetry: (id: string) => void;
  clearSyncQueue: () => void;
  logout: () => void;
  initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(persist(
    (set, get) => ({
      // Initial state
      isOnline: false,
      isAuthenticated: false,
      user: null,
      transactions: [],
      kycDocuments: [],
      exchangeRates: [],
      syncQueue: [],

      // Actions
      setOnlineStatus: (isOnline: boolean) => {
        const wasOffline = !get().isOnline;
        set({ isOnline });
        
        if (isOnline && wasOffline) {
          console.log('App came online - triggering local sync and transaction updates');
          // Trigger local sync when coming online
          syncService.syncPendingItems();
        }
      },

      setUser: (user: User | null) => set({ user }),

      setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        }));
        
        // Add to sync queue if offline
        if (!get().isOnline) {
          get().addToSyncQueue({
            type: 'transaction',
            action: 'create',
            data: transaction,
          });
        }
      },

      updateTransaction: (id: string, updates: Partial<Transaction>) => {
        set((state) => ({
          transactions: state.transactions.map((t) => {
            if (t.id === id) {
              const updatedTransaction = { ...t, ...updates, updatedAt: new Date() };
              
              // Log status changes for debugging
              if (updates.status && t.status !== updates.status) {
                console.log(`Transaction ${id} status changed from ${t.status} to ${updates.status} (local update)`);
              }
              
              if (updates.syncStatus && t.syncStatus !== updates.syncStatus) {
                console.log(`Transaction ${id} sync status changed to ${updates.syncStatus}`);
              }
              
              return updatedTransaction;
            }
            return t;
          }),
        }));
      },

      addKYCDocument: (document: KYCDocument) => {
        set((state) => ({
          kycDocuments: [document, ...state.kycDocuments],
        }));
        
        // Add to sync queue if offline
        if (!get().isOnline) {
          get().addToSyncQueue({
            type: 'kyc',
            action: 'create',
            data: document,
          });
        }
      },

      updateKYCDocument: (id: string, updates: Partial<KYCDocument>) => {
        set((state) => ({
          kycDocuments: state.kycDocuments.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
        }));
      },

      setExchangeRates: (rates: ExchangeRate[]) => set({ exchangeRates: rates }),

      addToSyncQueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'retryCount'>) => {
        const syncItem: SyncItem = {
          ...item,
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          retryCount: 0,
        };
        
        set((state) => ({
          syncQueue: [...state.syncQueue, syncItem],
        }));
      },

      removeFromSyncQueue: (id: string) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
        }));
      },

      incrementSyncRetry: (id: string) => {
        set((state) => ({
          syncQueue: state.syncQueue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
          ),
        }));
      },

      clearSyncQueue: () => set({ syncQueue: [] }),

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          transactions: [],
          kycDocuments: [],
          syncQueue: [],
        });
      },

      initializeApp: async () => {
        try {
          // Perform security checks
          const securityCheck = await securityService.performSecurityCheck();
          
          if (securityCheck.isJailbroken) {
            throw new Error('Security violation detected');
          }
          
          // Initialize other services
          await syncService.initialize();
          
          // Additional check: if we're online after initialization, update processing transactions
          const { isOnline } = get();
          if (isOnline) {
            console.log('App initialized and online - ensuring processing transactions are updated');
            await syncService.updateProcessingTransactions();
          }
        } catch (error) {
          console.error('App initialization failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'jaudi-finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        transactions: state.transactions,
        kycDocuments: state.kycDocuments,
        exchangeRates: state.exchangeRates,
        syncQueue: state.syncQueue,
      }),
    }
  )
);