import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface TransactionHistoryScreenStyles {
  container: ViewStyle;
  header: ViewStyle;
  headerTop: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  filters: ViewStyle;
  filterButton: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  listContainer: ViewStyle;
  transactionItem: ViewStyle;
  transactionHeader: ViewStyle;
  transactionInfo: ViewStyle;
  recipientName: TextStyle;
  recipientPhone: TextStyle;
  transactionAmount: ViewStyle;
  amountText: TextStyle;
  statusContainer: ViewStyle;
  statusDot: ViewStyle;
  statusText: TextStyle;
  syncIndicator: TextStyle;
  transactionFooter: ViewStyle;
  transactionDate: TextStyle;
  transactionDescription: TextStyle;
  transactionId: TextStyle;
  emptyState: ViewStyle;
  emptyStateTitle: TextStyle;
  emptyStateMessage: TextStyle;
}

export const styles = StyleSheet.create<TransactionHistoryScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
    flexWrap: 'nowrap',
  },
  
  filterButton: {
    flexShrink: 0,
    minWidth: 80,
    paddingHorizontal: 12,
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
  
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  transactionInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  
  recipientPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  transactionAmount: {
    alignItems: 'flex-end',
  },
  
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  syncIndicator: {
    fontSize: 12,
    marginLeft: 4,
  },
  
  transactionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
    gap: 4,
  },
  
  transactionDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  
  transactionDescription: {
    fontSize: 14,
    color: '#000000',
    fontStyle: 'italic',
  },
  
  transactionId: {
    fontSize: 12,
    color: '#C7C7CC',
    fontFamily: 'monospace',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptyStateMessage: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 24,
  },
});