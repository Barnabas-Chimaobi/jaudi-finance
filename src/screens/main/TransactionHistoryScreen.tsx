import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useAppStore } from '../../stores/appStore';
import { databaseService } from '../../services/databaseService';
import { apiService } from '../../services/apiService';
import { syncService } from '../../services/syncService';
import { Transaction } from '../../types';
import { styles } from './TransactionHistoryScreen.styles';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'processing':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created':
        return 'Created';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getSyncStatusIndicator = (syncStatus: string) => {
    switch (syncStatus) {
      case 'pending':
        return '⏳';
      case 'syncing':
        return '🔄';
      case 'failed':
        return '❌';
      case 'synced':
        return '✅';
      default:
        return '';
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.recipientName}>{transaction.recipientName}</Text>
          <Text style={styles.recipientPhone}>{transaction.recipientPhone || 'N/A'}</Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>
            -{formatCurrency(transaction.amount, transaction.currency)}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaction.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
              {getStatusText(transaction.status)}
            </Text>
            <Text style={styles.syncIndicator}>
              {getSyncStatusIndicator(transaction.syncStatus)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionFooter}>
        <Text style={styles.transactionDate}>
          {formatDate(transaction.createdAt)}
        </Text>
        
        {transaction.description && (
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {transaction.description}
          </Text>
        )}
        
        <Text style={styles.transactionId}>
          ID: {transaction.id}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const TransactionHistoryScreen: React.FC = () => {
  const { user, isOnline } = useAppStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available for loading transactions');
        setTransactions([]);
        return;
      }
  
      console.log(`Loading transactions for user: ${user.id}`);
      const allTransactions = await databaseService.getTransactions(user.id);
      console.log(`Retrieved ${allTransactions.length} transactions from database`);
      
      let filteredTransactions = allTransactions;
      
      switch (filter) {
        case 'pending':
          filteredTransactions = allTransactions.filter(t => 
            t.status === 'created' || t.status === 'processing'
          );
          break;
        case 'completed':
          filteredTransactions = allTransactions.filter(t => t.status === 'completed');
          break;
        case 'failed':
          filteredTransactions = allTransactions.filter(t => 
            t.status === 'failed' || t.status === 'cancelled'
          );
          break;
        default:
          // Show all transactions
          break;
      }
      
      // Sort by creation date (newest first)
      filteredTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log(`Filtered to ${filteredTransactions.length} transactions`);
      setTransactions(filteredTransactions as Transaction[]);
      
    } catch (error) {
      console.error('Failed to load transactions:', error);
      
      // Only show error alert when online
      if (isOnline) {
        Alert.alert('Error', 'Failed to load transaction history');
      } else {
        console.log('Offline: Failed to load transactions, showing empty state');
        setTransactions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filter, isOnline]);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    try {
      console.log('Transaction pressed:', transaction.id);
      
      Alert.alert(
        'Transaction Details',
        `Transaction ID: ${transaction.transactionId || transaction.id}\n` +
        `Recipient: ${transaction.recipientName}\n` +
        `Amount: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: transaction.currency || 'USD',
        }).format(transaction.amount)}\n` +
        `Status: ${transaction.status}\n` +
        `Date: ${new Date(transaction.createdAt).toLocaleString()}\n` +
        `${transaction.description ? `Description: ${transaction.description}\n` : ''}` +
        `Sync Status: ${transaction.syncStatus}`,
        [
          {
            text: 'OK',
            style: 'default' as const,
          },
          ...(transaction.syncStatus === 'failed' ? [
            {
              text: 'Retry Sync',
              style: 'default' as const,
              onPress: () => retryTransactionSync(transaction),
            },
          ] : []),
        ]
      );
    } catch (error) {
      console.error('Error displaying transaction details:', error);
      Alert.alert('Error', 'Failed to display transaction details');
    }
  }, []);

  const syncTransactions = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      // Sync pending transactions
      await syncService.syncPendingItems();
      
      // Fetch latest transaction updates from server
      const response = await apiService.getTransactions(user?.id || '');
      if (response.success && response.data) {
        // Update local database with server data
        for (const serverTransaction of response.data.transactions || []) {
          const localTransaction = await databaseService.getTransactionById(serverTransaction.id);
          if (localTransaction) {
            // Update existing transaction
            await databaseService.updateTransaction(serverTransaction.id, {
              status: serverTransaction.status,
              syncStatus: 'synced',
              updatedAt: new Date(),
            });
          }
        }
        
        // Reload transactions to reflect updates
        await loadTransactions();
      }
    } catch (error) {
      console.error('Failed to sync transactions:', error);
    }
  }, [isOnline, user?.id, loadTransactions]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  useEffect(() => {
    if (isOnline) {
      syncTransactions();
    }
  }, [isOnline, syncTransactions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    if (isOnline) {
      await syncTransactions();
    } else {
      await loadTransactions();
    }
    
    setIsRefreshing(false);
  }, [isOnline, syncTransactions, loadTransactions]);

  // Remove this duplicate function declaration (lines ~279-295)
  // const handleTransactionPress = (transaction: Transaction) => {
  //   Alert.alert(
  //     'Transaction Details',
  //     `Transaction ID: ${transaction.id}\n` +
  //     `Recipient: ${transaction.recipientName}\n` +
  //     `Amount: ${new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: transaction.currency,
  //     }).format(transaction.amount)}\n` +
  //     `Status: ${transaction.status}\n` +
  //     `Date: ${new Date(transaction.createdAt).toLocaleString()}\n` +
  //     `${transaction.description ? `Description: ${transaction.description}\n` : ''}` +
  //     `Sync Status: ${transaction.syncStatus}`,
  //     [
  //       {
  //         text: 'OK',
  //         style: 'default' as const,
  //       },
  //       ...(transaction.syncStatus === 'failed' ? [
  //         {
  //           text: 'Retry Sync',
  //           style: 'default' as const,
  //           onPress: () => retryTransactionSync(transaction),
  //         },
  //       ] : []),
  //     ]
  //   );
  // };

  const retryTransactionSync = async (transaction: Transaction) => {
    if (!isOnline) {
      Alert.alert('Offline', 'Please connect to the internet to retry sync');
      return;
    }
    
    try {
      await syncService.forceSyncTransaction(transaction.id);
      await loadTransactions();
      Alert.alert('Success', 'Transaction sync retried successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to retry transaction sync');
    }
  };

  const renderFilterButton = (filterType: typeof filter, title: string, emoji: string) => {
    const isActive = filter === filterType;
    return (
      <Button
        title={title}
        onPress={() => setFilter(filterType)}
        variant={isActive ? 'primary' : 'outline'}
        size="small"
        style={styles.filterButton}
        icon={
          <Text style={{ fontSize: 16, color: isActive ? '#FFFFFF' : '#007AFF' }}>
            {emoji}
          </Text>
        }
        iconPosition="left"
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Transactions</Text>
      <Text style={styles.emptyStateMessage}>
        {filter === 'all' 
          ? 'You haven\'t made any transactions yet.'
          : `No ${filter} transactions found.`
        }
      </Text>
    </View>
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={handleTransactionPress}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Transaction History</Text>
            <Text style={styles.subtitle}>
              {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
          <ConnectionStatus 
            compact={true} 
            showSyncButton={false} 
            autoHide={true}
            autoHideDuration={4000}
            showOnlyOnChange={true}
          />
        </View>
      </View>

      <View style={styles.filters}>
        {renderFilterButton('all', 'All', '📋')}
        {renderFilterButton('pending', 'Pending', '⏳')}
        {renderFilterButton('completed', 'Completed', '✅')}
        {renderFilterButton('failed', 'Failed', '❌')}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default TransactionHistoryScreen;