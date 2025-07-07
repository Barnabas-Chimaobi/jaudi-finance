import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { securityService } from '../../services/securityService';
import { BiometricAuthResult } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import { styles } from './BiometricPrompt.styles';

interface BiometricPromptProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  cancelText?: string;
  fallbackText?: string;
  onSuccess: (result: BiometricAuthResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  onFallback?: () => void;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  title = 'Biometric Authentication',
  subtitle = 'Use your biometric to authenticate',
  description = 'Place your finger on the sensor or look at the camera to continue',
  cancelText = 'Cancel',
  fallbackText = 'Use PIN',
  onSuccess,
  onError,
  onCancel,
  onFallback,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);
  const statusOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      startAuthentication();
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.8, { duration: 200 });
      resetState();
    }
  }, [visible]);

  useEffect(() => {
    if (authStatus === 'authenticating') {
      // Pulse animation during authentication
      pulseScale.value = withTiming(1.1, { duration: 800 }, () => {
        pulseScale.value = withTiming(1, { duration: 800 });
      });
    }
  }, [authStatus]);

  const resetState = () => {
    setIsAuthenticating(false);
    setAuthStatus('idle');
    setErrorMessage('');
    statusOpacity.value = 0;
  };

  const startAuthentication = async () => {
    try {
      setIsAuthenticating(true);
      setAuthStatus('authenticating');
      statusOpacity.value = withTiming(1, { duration: 300 });

      const result = await securityService.authenticateWithBiometrics({
        promptMessage: subtitle,
        cancelButtonText: cancelText,
        fallbackButtonText: onFallback ? fallbackText : undefined,
      });

      if (result.success) {
        setAuthStatus('success');
        setTimeout(() => {
          runOnJS(onSuccess)(result);
        }, 500);
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setAuthStatus('error');
      setErrorMessage(errorMsg);
      
      setTimeout(() => {
        runOnJS(onError)(errorMsg);
      }, 1000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleFallback = () => {
    resetState();
    onFallback?.();
  };

  const handleRetry = () => {
    setErrorMessage('');
    startAuthentication();
  };

  const modalAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ scale: modalScale.value }],
    };
  });

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const statusAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: statusOpacity.value,
    };
  });

  const getBiometricIcon = () => {
    if (Platform.OS === 'ios') {
      return '👆'; // Face ID or Touch ID
    }
    return '🔒'; // Fingerprint
  };

  const getStatusIcon = () => {
    switch (authStatus) {
      case 'authenticating':
        return <LoadingSpinner size="small" color="#007AFF" />;
      case 'success':
        return <Text style={styles.statusIcon}>✅</Text>;
      case 'error':
        return <Text style={styles.statusIcon}>❌</Text>;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (authStatus) {
      case 'authenticating':
        return 'Authenticating...';
      case 'success':
        return 'Authentication successful!';
      case 'error':
        return errorMessage || 'Authentication failed';
      default:
        return '';
    }
  };

  const getStatusTextStyle = () => {
    switch (authStatus) {
      case 'success':
        return [styles.statusText, styles.successText];
      case 'error':
        return [styles.statusText, styles.errorText];
      default:
        return styles.statusText;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, modalAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.content}>
            <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
              <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
            </Animated.View>

            <Text style={styles.description}>{description}</Text>

            <Animated.View style={[styles.statusContainer, statusAnimatedStyle]}>
              {getStatusIcon()}
              <Text style={getStatusTextStyle()}>{getStatusText()}</Text>
            </Animated.View>
          </View>

          <View style={styles.actions}>
            {authStatus === 'error' && (
              <Button
                title="Retry"
                onPress={handleRetry}
                variant="primary"
                size="medium"
                style={styles.actionButton}
              />
            )}
            
            {onFallback && (
              <Button
                title={fallbackText}
                onPress={handleFallback}
                variant="outline"
                size="medium"
                style={styles.actionButton}
              />
            )}
            
            <Button
              title={cancelText}
              onPress={handleCancel}
              variant="ghost"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BiometricPrompt;