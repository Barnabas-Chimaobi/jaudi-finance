import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface DashboardScreenStyles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  welcomeText: TextStyle;
  userName: TextStyle;
  statusCard: ViewStyle;
  onlineCard: ViewStyle;
  offlineCard: ViewStyle;
  statusHeader: ViewStyle;
  statusTitle: TextStyle;
  lastSyncText: TextStyle;
  pendingSyncText: TextStyle;
  statsCard: ViewStyle;
  statsTitle: TextStyle;
  statsGrid: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  quickActionsCard: ViewStyle;
  quickActionsTitle: TextStyle;
  quickActionsGrid: ViewStyle;
  quickActionButton: ViewStyle;
  recentTransactionsCard: ViewStyle;
  recentTransactionsHeader: ViewStyle;
  recentTransactionsTitle: TextStyle;
  viewAllText: TextStyle;
  emptyTransactions: ViewStyle;
  emptyTransactionsText: TextStyle;
  transactionsList: ViewStyle;
  transactionItem: ViewStyle;
  transactionInfo: ViewStyle;
  transactionRecipient: TextStyle;
  transactionDate: TextStyle;
  transactionAmount: ViewStyle;
  transactionAmountText: TextStyle;
  transactionStatus: ViewStyle;
  statusDot: ViewStyle;
  statusText: TextStyle;
}

export const styles = StyleSheet.create<DashboardScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 20,
  },
  
  header: {
    marginBottom: 8,
  },
  
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  onlineCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  
  offlineCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  
  lastSyncText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  pendingSyncText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  
  quickActionsGrid: {
    gap: 12,
  },
  
  quickActionButton: {
    marginBottom: 0,
  },
  
  recentTransactionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  recentTransactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  recentTransactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  
  emptyTransactionsText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  transactionsList: {
    gap: 12,
  },
  
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  
  transactionInfo: {
    flex: 1,
  },
  
  transactionRecipient: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  
  transactionAmount: {
    alignItems: 'flex-end',
  },
  
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});