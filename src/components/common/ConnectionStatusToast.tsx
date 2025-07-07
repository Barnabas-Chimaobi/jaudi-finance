import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useAppStore } from '../../stores/appStore';
import { styles } from './ConnectionStatusToast.styles';

interface ConnectionStatusToastProps {
  duration?: number;
}

const ConnectionStatusToast: React.FC<ConnectionStatusToastProps> = ({ 
  duration = 3000 
}) => {
  const { isOnline, syncQueue } = useAppStore();
  const [visible, setVisible] = useState(false);
  const previousOnlineStatus = useRef<boolean | null>(null);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [opacityAnim] = useState(new Animated.Value(0));

  const showToastHandler = () => {
    setVisible(true);
    slideAnim.setValue(-100);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }, duration);
  };

  useEffect(() => {
    if (isOnline !== previousOnlineStatus.current) {
      if (previousOnlineStatus.current !== null) {
        showToastHandler();
      }
      previousOnlineStatus.current = isOnline;
    }
  }, [isOnline, duration, showToastHandler]);



  const getToastMessage = () => {
    if (isOnline) {
      const pendingCount = syncQueue.length;
      if (pendingCount > 0) {
        return `Back online! Syncing ${pendingCount} pending ${pendingCount === 1 ? 'item' : 'items'}...`;
      }
      return 'Back online! All data is up to date.';
    } else {
      return 'You\'re offline. Actions will be saved and synced when reconnected.';
    }
  };

  const getToastIcon = () => {
    return isOnline ? '🟢' : '🔴';
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isOnline ? styles.onlineContainer : styles.offlineContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getToastIcon()}</Text>
        <Text style={[styles.message, isOnline ? styles.onlineMessage : styles.offlineMessage]}>
          {getToastMessage()}
        </Text>
      </View>
    </Animated.View>
  );
};

export default ConnectionStatusToast;