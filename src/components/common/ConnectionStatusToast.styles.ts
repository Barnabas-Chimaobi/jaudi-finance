import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ConnectionStatusToastStyles {
  container: ViewStyle;
  onlineContainer: ViewStyle;
  offlineContainer: ViewStyle;
  content: ViewStyle;
  icon: TextStyle;
  message: TextStyle;
  onlineMessage: TextStyle;
  offlineMessage: TextStyle;
}

export const styles = StyleSheet.create<ConnectionStatusToastStyles>({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingTop: 60, // Account for status bar and safe area
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  onlineContainer: {
    backgroundColor: '#D4F6DD',
    borderBottomWidth: 3,
    borderBottomColor: '#34C759',
  },

  offlineContainer: {
    backgroundColor: '#FFF3CD',
    borderBottomWidth: 3,
    borderBottomColor: '#FF9500',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginHorizontal: 8,
  },

  icon: {
    fontSize: 16,
    marginRight: 8,
  },

  message: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    lineHeight: 20,
  },

  onlineMessage: {
    color: '#1B5E20',
  },

  offlineMessage: {
    color: '#E65100',
  },
});