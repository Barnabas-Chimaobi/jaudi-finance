import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface InputStyles {
  wrapper: ViewStyle;
  container: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  floatingLabel: TextStyle;
  errorText: TextStyle;
  hintText: TextStyle;
  required: TextStyle;
  leftIconContainer: ViewStyle;
  rightIconContainer: ViewStyle;
  
  // Variants
  default: ViewStyle;
  filled: ViewStyle;
  outline: ViewStyle;
  
  // Sizes
  small: ViewStyle;
  medium: ViewStyle;
  large: ViewStyle;
  
  // Input sizes
  smallInput: TextStyle;
  mediumInput: TextStyle;
  largeInput: TextStyle;
  
  // Label sizes
  smallLabel: TextStyle;
  mediumLabel: TextStyle;
  largeLabel: TextStyle;
  
  // States
  disabled: ViewStyle;
  error: ViewStyle;
  disabledInput: TextStyle;
  requiredLabel: TextStyle;
  
  // Icon positioning
  inputWithLeftIcon: TextStyle;
  inputWithRightIcon: TextStyle;
}

export const styles = StyleSheet.create<InputStyles>({
  wrapper: {
    marginBottom: 20,
  },
  
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    marginTop: 8,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    paddingVertical: 0,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 6,
    position: 'relative',
    left: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  
  floatingLabel: {
    position: 'absolute',
    left: 16,
    top: 12,
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 2,
    lineHeight: 16,
  },
  
  hintText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 6,
    marginLeft: 2,
    lineHeight: 16,
  },
  
  required: {
    color: '#FF3B30',
  },
  
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  
  filled: {
    backgroundColor: '#F2F2F7',
    borderColor: 'transparent',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#E5E5EA',
    borderWidth: 2,
  },
  
  // Sizes
  small: {
    minHeight: 40,
    borderRadius: 8,
  },
  
  medium: {
    minHeight: 48,
    borderRadius: 12,
  },
  
  large: {
    minHeight: 56,
    borderRadius: 16,
  },
  
  // Input sizes
  smallInput: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  
  mediumInput: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  
  largeInput: {
    fontSize: 18,
    lineHeight: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  // Label sizes
  smallLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  mediumLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  largeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // States
  disabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
    opacity: 0.6,
  },
  
  error: {
    borderColor: '#FF3B30',
  },
  
  disabledInput: {
    color: '#8E8E93',
  },
  
  requiredLabel: {
    // Additional styles for required labels if needed
  },
  
  // Icon positioning
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  
  inputWithRightIcon: {
    paddingRight: 0,
  },
});