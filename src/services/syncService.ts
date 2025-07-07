import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../stores/appStore';
import { SyncItem, Transaction, KYCDocument } from '../types';
import { apiService } from './apiService';
import { databaseService } from './databaseService';

class SyncService {
  private syncInProgress = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  async initialize(): Promise<void> {
    // Listen for network changes
    NetInfo.addEventListener((state) => {
      const { setOnlineStatus } = useAppStore.getState();
      setOnlineStatus(state.isConnected ?? false);
    });
  
    // Initial network check
    const state = await NetInfo.fetch();
    const { setOnlineStatus } = useAppStore.getState();
    const isOnline = state.isConnected ?? false;
    setOnlineStatus(isOnline);
    
    // Update processing transactions if online on startup
    if (isOnline) {
      console.log('App started online - updating processing transactions');
      await this.updateProcessingTransactionsLocally();
    }
  }

  /**
   * Sync all pending items in the queue and update processing transactions
   */
  async syncPendingItems(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    const { isOnline, syncQueue } = useAppStore.getState();
    
    if (!isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log(`Starting sync for ${syncQueue.length} items`);

    try {
      // First, update any processing transactions to completed (local only)
      await this.updateProcessingTransactionsLocally();
      
      // Then sync pending items (currently no API, so just mark as synced locally)
      for (const item of syncQueue) {
        await this.syncItemLocally(item);
      }
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Update processing transactions to completed when coming online (local database only)
   */
  private async updateProcessingTransactionsLocally(): Promise<void> {
    const { user, updateTransaction } = useAppStore.getState();
    
    if (!user?.id) {
      console.log('No user ID available for updating processing transactions');
      return;
    }
    
    // Load transactions directly from database instead of store state
    const allTransactions = await databaseService.getTransactions(user.id);
    
    // Find all processing transactions
    const processingTransactions = allTransactions.filter(
      (transaction) => transaction.status === 'processing'
    );
    
    if (processingTransactions.length === 0) {
      console.log('No processing transactions to update');
      return;
    }
    
    console.log(`Updating ${processingTransactions.length} processing transactions to completed (local only)`);
    
    for (const transaction of processingTransactions) {
      try {
        // Update transaction status to completed
        const updates = {
          status: 'completed' as const,
          updatedAt: new Date(),
          syncStatus: 'synced' as const, // Mark as synced since we're not using API
        };
        
        // Update in local store using the transaction id
        updateTransaction(transaction.transactionId, updates);
        
        // Update in local database using the transactionId (which maps to transaction_id column)
        await databaseService.updateTransaction(transaction.transactionId, updates);
        
        console.log(`Transaction ${transaction.transactionId} successfully updated to completed in local database`);
      } catch (error) {
        console.error(`Failed to update transaction ${transaction.transactionId} in local database:`, error);
      }
    }
  }

  /**
   * Public method to update processing transactions to completed (local database only)
   */
  async updateProcessingTransactions(): Promise<void> {
    const { isOnline } = useAppStore.getState();
    
    if (!isOnline) {
      console.log('Cannot update processing transactions while offline');
      return;
    }
    
    await this.updateProcessingTransactionsLocally();
  }

  /**
   * Process sync items locally (no API calls)
   */
  private async syncItemLocally(item: SyncItem): Promise<void> {
    const { removeFromSyncQueue } = useAppStore.getState();

    try {
      let success = false;

      switch (item.type) {
        case 'transaction':
          success = await this.syncTransactionLocally(item);
          break;
        case 'kyc':
          success = await this.syncKYCDocumentLocally(item);
          break;
        case 'user':
          success = await this.syncUserLocally(item);
          break;
        case 'notification':
          success = true; // Skip notifications since no API
          break;
        default:
          console.warn(`Unknown sync item type: ${item.type}`);
          success = true; // Remove unknown items
      }

      if (success) {
        removeFromSyncQueue(item.id);
        console.log(`Successfully processed sync item locally: ${item.id}`);
      } else {
        await this.handleSyncFailure(item);
      }
    } catch (error) {
      console.error(`Local sync failed for item ${item.id}:`, error);
      await this.handleSyncFailure(item);
    }
  }

  /**
   * Sync transaction data locally (no API calls)
   */
  private async syncTransactionLocally(item: SyncItem): Promise<boolean> {
    try {
      const transaction: Transaction = item.data;
      const { updateTransaction } = useAppStore.getState();
      
      switch (item.action) {
        case 'create':
          // Transaction already exists locally, just mark as synced
          updateTransaction(transaction.id, {
            syncStatus: 'synced',
            updatedAt: new Date(),
          });
          
          // Update in database using transaction.id as the transaction_id value
          await databaseService.updateTransaction(transaction.id, {
            syncStatus: 'synced',
            updatedAt: new Date(),
          });
          
          console.log(`Transaction ${transaction.id} marked as synced locally`);
          return true;
          
        case 'update':
          // Update already processed, just mark as synced
          updateTransaction(transaction.id, {
            syncStatus: 'synced',
            updatedAt: new Date(),
          });
          
          await databaseService.updateTransaction(transaction.id, {
            syncStatus: 'synced',
            updatedAt: new Date(),
          });
          
          console.log(`Transaction update ${transaction.id} marked as synced locally`);
          return true;
      }
      
      return false;
    } catch (error) {
      console.error('Local transaction sync failed:', error);
      return false;
    }
  }

  /**
   * Sync KYC document locally (no API calls)
   */
  private async syncKYCDocumentLocally(item: SyncItem): Promise<boolean> {
    try {
      const document: KYCDocument = item.data;
      const { updateKYCDocument } = useAppStore.getState();
      
      // Mark KYC document as synced locally
      updateKYCDocument(document.id, {
        syncStatus: 'synced',
      });
      
      console.log(`KYC document ${document.id} marked as synced locally`);
      return true;
    } catch (error) {
      console.error('Local KYC document sync failed:', error);
      return false;
    }
  }

  /**
   * Sync user data locally (no API calls)
   */
  private async syncUserLocally(item: SyncItem): Promise<boolean> {
    try {
      // User data is already updated locally, just mark as processed
      console.log('User data sync processed locally');
      return true;
    } catch (error) {
      console.error('Local user sync failed:', error);
      return false;
    }
  }

  /**
   * Handle sync failure with retry logic
   */
  private async handleSyncFailure(item: SyncItem): Promise<void> {
    const { incrementSyncRetry, removeFromSyncQueue } = useAppStore.getState();

    if (item.retryCount >= this.maxRetries) {
      console.error(`Max retries exceeded for item ${item.id}, removing from queue`);
      removeFromSyncQueue(item.id);
      
      // Store failed item for manual retry later
      await databaseService.storeFailedSyncItem(item);
    } else {
      incrementSyncRetry(item.id);
      
      // Schedule retry with exponential backoff
      const delay = this.retryDelay * Math.pow(2, item.retryCount);
      setTimeout(() => {
        this.syncItemLocally(item);
      }, delay);
    }
  }

  /**
   * Force sync specific transaction locally
   */
  async forceSyncTransactionLocally(transactionId: string): Promise<boolean> {
    const { transactions, isOnline } = useAppStore.getState();
    
    if (!isOnline) {
      console.warn('Cannot force sync while offline');
      return false;
    }

    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
      console.error('Transaction not found for force sync');
      return false;
    }

    const syncItem: SyncItem = {
      id: `force_sync_${Date.now()}`,
      type: 'transaction',
      action: 'create',
      data: transaction,
      timestamp: new Date(),
      retryCount: 0,
    };

    return await this.syncTransactionLocally(syncItem);
  }

  /**
   * Get sync status summary
   */
  getSyncStatus(): {
    pendingItems: number;
    isOnline: boolean;
    syncInProgress: boolean;
  } {
    const { syncQueue, isOnline } = useAppStore.getState();
    
    return {
      pendingItems: syncQueue.length,
      isOnline,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Clear all failed sync items
   */
  async clearFailedSyncItems(): Promise<void> {
    await databaseService.clearFailedSyncItems();
  }

  /**
   * Retry all failed sync items
   */
  async retryFailedSyncItems(): Promise<void> {
    const failedItems = await databaseService.getFailedSyncItems();
    const { addToSyncQueue } = useAppStore.getState();
    
    failedItems.forEach(item => {
      addToSyncQueue({
        type: item.type,
        action: item.action,
        data: item.data,
      });
    });
    
    await this.syncPendingItems();
  }
}

export const syncService = new SyncService();