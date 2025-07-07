import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BiometricPromptStyles {
  overlay: ViewStyle;
  container: ViewStyle;
  header: ViewStyle;
  content: ViewStyle;
  actions: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  description: TextStyle;
  iconContainer: ViewStyle;
  biometricIcon: TextStyle;
  statusContainer: ViewStyle;
  statusIcon: TextStyle;
  statusText: TextStyle;
  successText: TextStyle;
  errorText: TextStyle;
  actionButton: ViewStyle;
}

export const styles = StyleSheet.create<BiometricPromptStyles>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  actions: {
    gap: 12,
  },
  
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  description: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  biometricIcon: {
    fontSize: 40,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 24,
    gap: 8,
  },
  
  statusIcon: {
    fontSize: 16,
  },
  
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  
  successText: {
    color: '#34C759',
  },
  
  errorText: {
    color: '#FF3B30',
  },
  
  actionButton: {
    marginBottom: 8,
  },
});