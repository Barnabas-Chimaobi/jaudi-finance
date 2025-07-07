import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button, LoadingSpinner } from '../../components/common';
import { useAppStore } from '../../stores/appStore';
import { databaseService } from '../../services/databaseService';
import { apiService } from '../../services/apiService';
import { syncService } from '../../services/syncService';
import { securityService } from '../../services/securityService';
import { Transaction } from '../../types';
import { styles } from './DashboardScreen.styles';

interface DashboardStats {
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  totalAmountSent: number;
  pendingSyncItems: number;
}

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isOnline, syncQueue, isAuthenticated } = useAppStore();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    totalAmountSent: 0,
    pendingSyncItems: 0,
  });
  
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  useEffect(() => {
    if (isOnline) {
      performSync();
    }
  }, [isOnline]);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      // If online, first update any processing transactions to completed
      if (isOnline) {
        await syncService.updateProcessingTransactions();
      }
  
      // Always try to load from local database first
      const transactions = await databaseService.getTransactions(user.id);
      console.log(`Loaded ${transactions.length} transactions from database`);
  
      if (transactions.length === 0) {
        // No local data available
        setStats({
          totalTransactions: 0,
          pendingTransactions: 0,
          completedTransactions: 0,
          totalAmountSent: 0,
          pendingSyncItems: syncQueue?.length || 0,
        });
        setRecentTransactions([]);
  
        if (!isOnline) {
          console.log('No offline data available');
        }
        return;
      }
  
      // Calculate stats from local transactions
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const pendingTransactions = transactions.filter(t => t.status === 'created' || t.status === 'processing');
      
      const stats = {
        totalTransactions: transactions.length,
        pendingTransactions: pendingTransactions.length,
        completedTransactions: completedTransactions.length,
        totalAmountSent: completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        pendingSyncItems: syncQueue?.length || 0,
      };
  
      setStats(stats);
      setRecentTransactions(transactions.slice(0, 5) as Transaction[]);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      if (isOnline) {
        Alert.alert('Error', 'Failed to load dashboard data');
      } else {
        console.log('Offline: Failed to load dashboard data, showing empty state');
        setStats({
          totalTransactions: 0,
          pendingTransactions: 0,
          completedTransactions: 0,
          totalAmountSent: 0,
          pendingSyncItems: syncQueue?.length || 0,
        });
        setRecentTransactions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isOnline, syncQueue]);

  const performSync = async () => {
    if (!isOnline) return;
    
    try {
      await syncService.syncPendingItems();
      setLastSyncTime(new Date());
      await loadDashboardData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    if (isOnline) {
      await performSync();
    } else {
      await loadDashboardData();
    }
    
    setIsRefreshing(false);
  };

  const handleSendMoney = () => {
    navigation.navigate('SendMoney' as never);
  };

  const handleViewTransactions = () => {
    navigation.navigate('History' as never);
  };

  const handleSecurityCheck = async () => {
    try {
      const securityResult = await securityService.performSecurityCheck();
      
      if (securityResult.isJailbroken) {
        Alert.alert(
          'Security Warning',
          'This device appears to be jailbroken/rooted. For your security, some features may be limited.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Security Check',
          'Your device passed all security checks.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to perform security check');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'processing':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const renderConnectionStatus = () => (
    <View style={[styles.statusCard, isOnline ? styles.onlineCard : styles.offlineCard]}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Text>
        {lastSyncTime && isOnline && (
          <Text style={styles.lastSyncText}>
            Last sync: {formatDate(lastSyncTime)}
          </Text>
        )}
      </View>
      
      {!isOnline && stats.pendingSyncItems > 0 && (
        <Text style={styles.pendingSyncText}>
          {stats.pendingSyncItems} items waiting to sync
        </Text>
      )}
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Account Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTransactions}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingTransactions}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.completedTransactions}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatCurrency(stats.totalAmountSent)}
          </Text>
          <Text style={styles.statLabel}>Total Sent</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      
      <View style={styles.quickActionsGrid}>
        <Button
          title="Send Money"
          onPress={handleSendMoney}
          variant="primary"
          style={styles.quickActionButton}
        />
        
        <Button
          title="View History"
          onPress={handleViewTransactions}
          variant="outline"
          style={styles.quickActionButton}
        />
        
        <Button
          title="Security Check"
          onPress={handleSecurityCheck}
          variant="secondary"
          style={styles.quickActionButton}
        />
      </View>
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.recentTransactionsCard}>
      <View style={styles.recentTransactionsHeader}>
        <Text style={styles.recentTransactionsTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 && (
          <TouchableOpacity onPress={handleViewTransactions}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {recentTransactions.length === 0 ? (
        <View style={styles.emptyTransactions}>
          <Text style={styles.emptyTransactionsText}>
            No transactions yet. Start by sending money!
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {recentTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => navigation.navigate('History' as never)}
            >
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionRecipient}>
                  {transaction.recipientName}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>
              
              <View style={styles.transactionAmount}>
                <Text style={styles.transactionAmountText}>
                  -{formatCurrency(transaction.amount, transaction.currency)}
                </Text>
                <View style={styles.transactionStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(transaction.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) }
                  ]}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
        </View>

        {renderConnectionStatus()}
        {renderStatsCard()}
        {renderQuickActions()}
        {renderRecentTransactions()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;