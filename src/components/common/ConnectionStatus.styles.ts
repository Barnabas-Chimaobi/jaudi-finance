import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ConnectionStatusStyles {
  container: ViewStyle;
  compactContainer: ViewStyle;
  statusCard: ViewStyle;
  onlineCard: ViewStyle;
  offlineCard: ViewStyle;
  statusHeader: ViewStyle;
  statusTitleContainer: ViewStyle;
  statusTitle: TextStyle;
  statusDot: ViewStyle;
  onlineDot: ViewStyle;
  offlineDot: ViewStyle;
  statusIndicator: ViewStyle;
  onlineIndicator: ViewStyle;
  offlineIndicator: ViewStyle;
  compactText: TextStyle;
  onlineText: TextStyle;
  offlineText: TextStyle;
  syncButton: ViewStyle;
  syncButtonText: TextStyle;
  statusDescription: TextStyle;
  pendingContainer: ViewStyle;
  pendingText: TextStyle;
  pendingBadge: ViewStyle;
  pendingBadgeText: TextStyle;
  lastSyncText: TextStyle;
}

export const styles = StyleSheet.create<ConnectionStatusStyles>({
  container: {
    marginVertical: 8,
  },

  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    borderLeftColor: '#FF9500',
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  onlineDot: {
    backgroundColor: '#34C759',
  },

  offlineDot: {
    backgroundColor: '#FF9500',
  },

  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  onlineIndicator: {
    backgroundColor: '#34C759',
  },

  offlineIndicator: {
    backgroundColor: '#FF9500',
  },

  compactText: {
    fontSize: 12,
    fontWeight: '500',
  },

  onlineText: {
    color: '#34C759',
  },

  offlineText: {
    color: '#FF9500',
  },

  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },

  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  statusDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },

  pendingContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },

  pendingText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },

  pendingBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  lastSyncText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});