import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface SendMoneyScreenStyles {
  container: ViewStyle;
  keyboardAvoid: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  form: ViewStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  currencyContainer: ViewStyle;
  currencyLabel: TextStyle;
  currencyOptions: ViewStyle;
  currencyButton: ViewStyle;
  exchangeRateCard: ViewStyle;
  exchangeRateTitle: TextStyle;
  exchangeRateHeader: ViewStyle;  // Add this
  defaultRateWarning: TextStyle;  // Add this
  offlineIndicator: TextStyle;    // Add this
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  exchangeRateDetails: ViewStyle;
  exchangeRateRow: ViewStyle;
  exchangeRateLabel: TextStyle;
  exchangeRateValue: TextStyle;
  totalRow: ViewStyle;
  totalLabel: TextStyle;
  totalValue: TextStyle;
  actions: ViewStyle;
  sendButton: ViewStyle;
}

export const styles = StyleSheet.create<SendMoneyScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  form: {
    flex: 1,
    marginBottom: 32,
  },
  
  section: {
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  
  currencyContainer: {
    marginBottom: 16,
  },
  
  currencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  
  currencyOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  
  currencyButton: {
    minWidth: 60,
  },
  
  exchangeRateCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden', // Prevent content from spilling outside
  },
  
  exchangeRateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    flexWrap: 'wrap', // Allow text to wrap
  },
  
  exchangeRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap', // Allow wrapping if content is too wide
    minHeight: 24, // Ensure minimum height
  },
  
  exchangeRateDetails: {
    gap: 12,
    flex: 1, // Take available space
  },
  
  exchangeRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top instead of center
    flexWrap: 'wrap', // Allow wrapping for long content
    minHeight: 20, // Ensure minimum height
  },
  
  exchangeRateLabel: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1, // Take available space
    marginRight: 8, // Add some spacing
    flexWrap: 'wrap',
  },
  
  exchangeRateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1, // Take available space
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    flex: 1,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  
  defaultRateWarning: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
  
  offlineIndicator: {
    fontSize: 12,
    color: '#FF9500',
    fontStyle: 'italic',
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  
  exchangeRateDetails: {
    gap: 12,
  },
  
  exchangeRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  exchangeRateLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  exchangeRateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginTop: 8,
  },
  
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  
  actions: {
    paddingTop: 16,
  },
  
  sendButton: {
    marginBottom: 16,
  },
});