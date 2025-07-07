import { Database, Q } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from '../database/schema';
import { Transaction, KYCDocument, User, SyncItem } from '../types';
import TransactionModel from '../database/models/Transaction';
import KYCDocumentModel from '../database/models/KYCDocument';
import UserModel from '../database/models/User';
import SyncItemModel from '../database/models/SyncItem';

class DatabaseService {
  private database: Database;

  constructor() {
    const adapter = new SQLiteAdapter({
      schema,
      dbName: 'JaudiFinanceDB',
      migrations: {
        validated: true,
        minVersion: 1,
        maxVersion: 1,
        sortedMigrations: []
      },
      jsi: true,
      onSetUpError: (error) => {
        console.error('Database setup error:', error);
      },
    });

    this.database = new Database({
      adapter,
      modelClasses: [
        TransactionModel as any,
        KYCDocumentModel as any,
        UserModel as any,
        SyncItemModel as any,
      ],
    });
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      // Database is automatically initialized when created
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Transaction operations
   */
  async createTransaction(transaction: Transaction): Promise<TransactionModel> {
    return await this.database.write(async () => {
      return await this.database.get<TransactionModel>('transactions').create((t) => {
        t.transactionId = transaction.id;
        t.userId = transaction.userId;
        t.recipientName = transaction.recipientName;
        t.recipientPhone = transaction.recipientPhone;
        t.amount = transaction.amount;
        t.currency = transaction.currency;
        t.exchangeRate = transaction.exchangeRate;
        t.fee = transaction.fee;
        t.totalAmount = transaction.totalAmount;
        t.status = transaction.status;
        t.reference = transaction.reference;
        t.description = transaction.description || '';
        t.syncStatus = transaction.syncStatus;
        t.createdAt = transaction.createdAt;
        t.updatedAt = transaction.updatedAt;
      });
    });
  }

  async getTransactions(userId: string, limit = 50): Promise<TransactionModel[]> {
    const transactions = await this.database
      .get<TransactionModel>('transactions')
      .query(
        Q.where('user_id', userId),
        Q.sortBy('created_at', Q.desc),
        Q.take(limit)
      )
      .fetch();
    
    return transactions;
  }

  async getTransaction(transactionId: string): Promise<TransactionModel | null> {
    try {
      const transactions = await this.database
        .get<TransactionModel>('transactions')
        .query(Q.where('transaction_id', transactionId))
        .fetch();
      
      return transactions.length > 0 ? transactions[0] : null;
    } catch (error) {
      console.error('Error getting transaction:', error);
      return null;
    }
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<TransactionModel> {
    return await this.database.write(async () => {
      // Find by transactionId field, not the record id
      const transactions = await this.database
        .get<TransactionModel>('transactions')
        .query(Q.where('transaction_id', transactionId))
        .fetch();
      
      if (transactions.length === 0) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      const transaction = transactions[0];
      
      return await transaction.update((t) => {
        if (updates.status) t.status = updates.status;
        if (updates.syncStatus) t.syncStatus = updates.syncStatus;
        if (updates.updatedAt) t.updatedAt = updates.updatedAt;
        // Add other fields as needed
        if (updates.amount !== undefined) t.amount = updates.amount;
        if (updates.recipientName) t.recipientName = updates.recipientName;
        if (updates.recipientPhone) t.recipientPhone = updates.recipientPhone;
      });
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.database.write(async () => {
      const transaction = await this.database
        .get<TransactionModel>('transactions')
        .find(id);
      
      await transaction.destroyPermanently();
    });
  }

  /**
   * KYC Document operations
   */
  async createKYCDocument(document: KYCDocument): Promise<KYCDocumentModel> {
    return await this.database.write(async () => {
      return await this.database.get<KYCDocumentModel>('kyc_documents').create((doc) => {
        doc.documentId = document.id;
        doc.userId = document.userId;
        doc.type = document.type;
        doc.frontImageUri = document.frontImageUri;
        doc.backImageUri = document.backImageUri || '';
        doc.status = document.status;
        doc.syncStatus = document.syncStatus;
        doc.uploadedAt = document.uploadedAt;
      });
    });
  }

  async getKYCDocuments(userId: string): Promise<KYCDocumentModel[]> {
    return await this.database
      .get<KYCDocumentModel>('kyc_documents')
      .query(
        Q.where('user_id', userId),
        Q.sortBy('uploaded_at', Q.desc)
      )
      .fetch();
  }

  async updateKYCDocument(id: string, updates: Partial<KYCDocument>): Promise<KYCDocumentModel> {
    return await this.database.write(async () => {
      const document = await this.database
        .get<KYCDocumentModel>('kyc_documents')
        .find(id);
      
      return await document.update((doc) => {
        if (updates.status) doc.status = updates.status;
        if (updates.syncStatus) doc.syncStatus = updates.syncStatus;
      });
    });
  }

  /**
   * User operations
   */
  async createUser(user: User): Promise<UserModel> {
    return await this.database.write(async () => {
      return await this.database.get<UserModel>('users').create((u) => {
        u.userId = user.id;
        u.email = user.email;
        u.firstName = user.firstName;
        u.lastName = user.lastName;
        u.phoneNumber = user.phoneNumber;
        u.kycStatus = user.kycStatus;
        u.biometricEnabled = user.biometricEnabled;
        u.createdAt = user.createdAt;
        u.updatedAt = user.updatedAt;
      });
    });
  }

  async getUser(id: string): Promise<UserModel | null> {
    try {
      return await this.database
        .get<UserModel>('users')
        .find(id);
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    try {
      const users = await this.database
        .get<UserModel>('users')
        .query(
          Q.where('email', email)
        )
        .fetch();
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<UserModel> {
    return await this.database.write(async () => {
      const user = await this.database
        .get<UserModel>('users')
        .find(id);
      
      return await user.update((u) => {
        if (updates.email) u.email = updates.email;
        if (updates.firstName) u.firstName = updates.firstName;
        if (updates.lastName) u.lastName = updates.lastName;
        if (updates.phoneNumber) u.phoneNumber = updates.phoneNumber;
        if (updates.kycStatus) u.kycStatus = updates.kycStatus;
        if (updates.biometricEnabled !== undefined) u.biometricEnabled = updates.biometricEnabled;
        if (updates.updatedAt) u.updatedAt = updates.updatedAt;
      });
    });
  }

  /**
   * Sync operations
   */
  async storeSyncItem(item: SyncItem): Promise<SyncItemModel> {
    return await this.database.write(async () => {
      return await this.database.get<SyncItemModel>('sync_items').create((s) => {
        s.syncId = item.id;
        s.type = item.type;
        s.action = item.action;
        s.data = JSON.stringify(item.data);
        s.timestamp = item.timestamp;
        s.retryCount = item.retryCount;
      });
    });
  }

  async getSyncItems(): Promise<SyncItemModel[]> {
    return await this.database
      .get<SyncItemModel>('sync_items')
      .query(
        Q.sortBy('timestamp', Q.asc)
      )
      .fetch();
  }

  async deleteSyncItem(id: string): Promise<void> {
    await this.database.write(async () => {
      const item = await this.database
        .get<SyncItemModel>('sync_items')
        .find(id);
      
      await item.destroyPermanently();
    });
  }

  async clearSyncItems(): Promise<void> {
    await this.database.write(async () => {
      const items = await this.database
        .get<SyncItemModel>('sync_items')
        .query()
        .fetch();
      
      await Promise.all(items.map(item => item.destroyPermanently()));
    });
  }

  /**
   * Failed sync items (for retry later)
   */
  async storeFailedSyncItem(item: SyncItem): Promise<void> {
    // Store in a separate table or mark with special status
    await this.storeSyncItem({
      ...item,
      id: `failed_${item.id}`,
    });
  }

  async getFailedSyncItems(): Promise<SyncItem[]> {
    const items = await this.database
      .get<SyncItemModel>('sync_items')
      .query(
        Q.where('sync_id', Q.like('failed_%'))
      )
      .fetch();
    
    return items.map(item => ({
      id: item.syncId,
      type: item.type as any,
      action: item.action as any,
      data: JSON.parse(item.data),
      timestamp: item.timestamp,
      retryCount: item.retryCount,
    }));
  }

  async clearFailedSyncItems(): Promise<void> {
    await this.database.write(async () => {
      const items = await this.database
        .get<SyncItemModel>('sync_items')
        .query(
          Q.where('sync_id', Q.like('failed_%'))
        )
        .fetch();
      
      await Promise.all(items.map(item => item.destroyPermanently()));
    });
  }

  /**
   * Database maintenance
   */
  async clearAllData(): Promise<void> {
    await this.database.write(async () => {
      await this.database.unsafeResetDatabase();
    });
  }

  async getStorageSize(): Promise<number> {
    // Implementation depends on platform
    // This is a placeholder - actual implementation would query SQLite
    return 0;
  }

  async vacuum(): Promise<void> {
    // SQLite VACUUM operation to reclaim space
    await this.database.adapter.unsafeExecute({
      sql: 'VACUUM',
      args: [],
    });
  }

  /**
   * Search operations
   */
  async searchTransactions(userId: string, query: string): Promise<TransactionModel[]> {
    return await this.database
      .get('transactions')
      .query(
        Q.where('user_id', userId),
        Q.or(
          Q.where('recipient_name', Q.like(`%${query}%`)),
          Q.where('reference', Q.like(`%${query}%`)),
          Q.where('description', Q.like(`%${query}%`))
        ),
        Q.sortBy('created_at', Q.desc)
      )
      .fetch() as TransactionModel[];
  }

  /**
   * Exchange Rate operations
   */
  async createExchangeRate(exchangeRate: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    timestamp: Date;
  }): Promise<void> {
    // For now, we'll store exchange rates in a simple key-value format
    // In a real implementation, you might want a dedicated ExchangeRate model
    const _key = `${exchangeRate.fromCurrency}_${exchangeRate.toCurrency}`;
    // This is a simplified implementation - in practice you'd want a proper model
  }

  async getExchangeRates(_fromCurrency: string, _toCurrency: string): Promise<Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    timestamp: Date;
  }>> {
    // This is a simplified implementation
    // In practice, you'd want to store exchange rates in a proper model
    // For now, return empty array - the app will handle this gracefully
    return [];
  }

  /**
   * Analytics and reporting
   */
  async getTransactionStats(userId: string, fromDate: Date, toDate: Date): Promise<{
    totalTransactions: number;
    totalAmount: number;
    successfulTransactions: number;
    failedTransactions: number;
  }> {
    const transactions = await this.database
      .get('transactions')
      .query(
        Q.where('user_id', userId),
        Q.where('created_at', Q.gte(fromDate.getTime())),
        Q.where('created_at', Q.lte(toDate.getTime()))
      )
      .fetch() as TransactionModel[];

    const stats = transactions.reduce(
      (acc, transaction) => {
        acc.totalTransactions++;
        acc.totalAmount += transaction.amount;
        
        if (transaction.status === 'completed') {
          acc.successfulTransactions++;
        } else if (transaction.status === 'failed') {
          acc.failedTransactions++;
        }
        
        return acc;
      },
      {
        totalTransactions: 0,
        totalAmount: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
      }
    );

    return stats;
  }
}

// Remove this duplicate import line:
// import { Q } from '@nozbe/watermelondb';

export const databaseService = new DatabaseService();