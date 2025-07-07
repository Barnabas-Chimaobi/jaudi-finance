import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface RegisterScreenStyles {
  container: ViewStyle;
  keyboardAvoid: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  progressBar: ViewStyle;
  progressStep: ViewStyle;
  progressStepActive: ViewStyle;
  stepContainer: ViewStyle;
  stepTitle: TextStyle;
  stepSubtitle: TextStyle;
  documentSection: ViewStyle;
  documentLabel: TextStyle;
  documentButton: ViewStyle;
  errorText: TextStyle;
  actions: ViewStyle;
  actionButton: ViewStyle;
  primaryButton: ViewStyle;
  footer: ViewStyle;
  loginContainer: ViewStyle;
  loginText: TextStyle;
  loginButton: ViewStyle;
}

export const styles = StyleSheet.create<RegisterScreenStyles>({
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
    marginBottom: 24,
  },
  
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  
  progressStep: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  
  stepContainer: {
    flex: 1,
    marginBottom: 32,
  },
  
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 24,
  },
  
  documentSection: {
    marginBottom: 24,
  },
  
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  
  documentButton: {
    marginBottom: 8,
  },
  
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
  },
  
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  
  actionButton: {
    flex: 1,
  },
  
  primaryButton: {
    // Additional styles for primary action button if needed
  },
  
  footer: {
    alignItems: 'center',
  },
  
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loginText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});