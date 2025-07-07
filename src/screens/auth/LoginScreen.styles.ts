import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface LoginScreenStyles {
  container: ViewStyle;
  keyboardAvoid: ViewStyle;
  scrollView: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  form: ViewStyle;
  footer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  errorText: TextStyle;
  loginButton: ViewStyle;
  biometricButton: ViewStyle;
  linkButton: ViewStyle;
  registerContainer: ViewStyle;
  registerText: TextStyle;
  registerButton: ViewStyle;
}

export const styles = StyleSheet.create<LoginScreenStyles>({
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  
  form: {
    flex: 1,
    marginBottom: 32,
  },
  
  footer: {
    alignItems: 'center',
    gap: 16,
  },
  
  title: {
    fontSize: 32,
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
  
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  
  loginButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  
  biometricButton: {
    marginBottom: 16,
  },
  
  linkButton: {
    paddingVertical: 8,
  },
  
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  registerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});