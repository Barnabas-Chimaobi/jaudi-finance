import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonStyles {
  button: ViewStyle;
  fullWidth: ViewStyle;
  disabled: ViewStyle;
  
  // Sizes
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
  
  // Variants
  primary: ViewStyle;
  secondary: ViewStyle;
  outline: ViewStyle;
  ghost: ViewStyle;
  danger: ViewStyle;
  
  // Text styles
  text: TextStyle;
  smallText: TextStyle;
  mediumText: TextStyle;
  largeText: TextStyle;
  
  // Text variants
  primaryText: TextStyle;
  secondaryText: TextStyle;
  outlineText: TextStyle;
  ghostText: TextStyle;
  dangerText: TextStyle;
  disabledText: TextStyle;
}

export const styles = StyleSheet.create<ButtonStyles>({
  // Base button style
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#F2F2F7',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Size variants
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 8,
  },
  
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 12,
  },
  
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
    borderRadius: 16,
  },
  
  // Color variants
  primary: {
    backgroundColor: '#007AFF',
    borderWidth: 0,
  },
  
  secondary: {
    backgroundColor: '#5856D6',
    borderWidth: 0,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  danger: {
    backgroundColor: '#FF3B30',
    borderWidth: 0,
  },
  
  // Base text style
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Text sizes
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },
  
  // Text color variants
  primaryText: {
    color: '#FFFFFF',
  },
  
  secondaryText: {
    color: '#FFFFFF',
  },
  
  outlineText: {
    color: '#007AFF',
  },
  
  ghostText: {
    color: '#007AFF',
  },
  
  dangerText: {
    color: '#FFFFFF',
  },
  
  disabledText: {
    color: '#8E8E93',
  },
});