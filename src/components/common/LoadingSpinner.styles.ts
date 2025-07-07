import { StyleSheet, ViewStyle } from 'react-native';

interface LoadingSpinnerStyles {
  container: ViewStyle;
  spinner: ViewStyle;
  overlay: ViewStyle;
}

export const styles = StyleSheet.create<LoadingSpinnerStyles>({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spinner: {
    borderStyle: 'solid',
  },
  
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});