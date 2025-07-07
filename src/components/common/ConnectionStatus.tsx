import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../stores/appStore';
import { syncService } from '../../services/syncService';
import { styles } from './ConnectionStatus.styles';

interface ConnectionStatusProps {
  showSyncButton?: boolean;
  showPendingCount?: boolean;
  compact?: boolean;
  style?: any;
  autoHide?: boolean;
  autoHideDuration?: number;
  showOnlyOnChange?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showSyncButton = true,
  showPendingCount = true,
  compact = false,
  style,
  autoHide = true,
  autoHideDuration = 5000,
  showOnlyOnChange = true,
}) => {
  const { isOnline, syncQueue } = useAppStore();
  const pendingItems = syncQueue.length;
  const [isVisible, setIsVisible] = useState(false);
  const previousOnlineStatus = useRef<boolean | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Show on first render (app start) or when connection status changes
    const shouldShow = !showOnlyOnChange || 
                      isFirstRender.current || 
                      (previousOnlineStatus.current !== null && previousOnlineStatus.current !== isOnline);
    
    if (shouldShow) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    }
    
    // Update previous status and first render flag
    previousOnlineStatus.current = isOnline;
    isFirstRender.current = false;
  }, [isOnline, autoHide, autoHideDuration, showOnlyOnChange]);

  const handleManualSync = async () => {
    if (isOnline) {
      try {
        await syncService.syncPendingItems();
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    }
  };

  const formatLastSync = () => {
    const lastSync = new Date();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastSync);
  };

  if (!isVisible) {
    return null;
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={[styles.statusIndicator, isOnline ? styles.onlineIndicator : styles.offlineIndicator]} />
        <Text style={[styles.compactText, isOnline ? styles.onlineText : styles.offlineText]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
        {!isOnline && pendingItems > 0 && showPendingCount && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingItems}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.statusCard, isOnline ? styles.onlineCard : styles.offlineCard]}>
        <View style={styles.statusHeader}>
          <View style={styles.statusTitleContainer}>
            <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
            <Text style={styles.statusTitle}>
              {isOnline ? 'Connected' : 'Offline Mode'}
            </Text>
          </View>
          
          {isOnline && showSyncButton && (
            <TouchableOpacity onPress={handleManualSync} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>🔄 Sync</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.statusDescription}>
          {isOnline 
            ? 'All features available. Data syncs automatically.'
            : 'Limited connectivity. Actions will be queued for sync.'
          }
        </Text>

        {!isOnline && pendingItems > 0 && showPendingCount && (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>
              📋 {pendingItems} {pendingItems === 1 ? 'item' : 'items'} waiting to sync
            </Text>
          </View>
        )}

        {isOnline && (
          <Text style={styles.lastSyncText}>
            Last updated: {formatLastSync()}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ConnectionStatus;