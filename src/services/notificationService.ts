import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { NotificationPayload } from '../types';
import { useAppStore } from '../stores/appStore';
import { apiService } from './apiService';
import { securityService } from './securityService';

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return;
      }

      await this.getFCMToken();
      this.setupMessageHandlers();
      this.setupTokenRefreshListener();
      this.isInitialized = true;
    } catch (error) {
      // Error handled silently
    }
  }

  private async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      return false;
    }
  }

  private async getFCMToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        
        await securityService.storeSecureData('fcm_token', token);
        await this.registerTokenWithBackend(token);
      }
    } catch (error) {
      // Error handled silently
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      const { isAuthenticated, isOnline, addToSyncQueue } = useAppStore.getState();
      if (isAuthenticated) {
        if (isOnline) {
          await apiService.registerFCMToken(token);
        } else {
          addToSyncQueue({
            type: 'notification',
            action: 'register_token',
            data: { fcmToken: token },
          });
        }
      }
    } catch (error) {
      const { isAuthenticated, addToSyncQueue } = useAppStore.getState();
      if (isAuthenticated) {
        addToSyncQueue({
          type: 'notification',
          action: 'register_token',
          data: { fcmToken: token },
        });
      }
    }
  }

  private setupMessageHandlers(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      await this.handleBackgroundMessage(remoteMessage);
    });

    messaging().onMessage(async (remoteMessage) => {
      await this.handleForegroundMessage(remoteMessage);
    });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      this.handleNotificationPress(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          this.handleNotificationPress(remoteMessage);
        }
      });
  }

  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      this.fcmToken = token;
      
      await securityService.storeSecureData('fcm_token', token);
      await this.registerTokenWithBackend(token);
    });
  }

  private async handleBackgroundMessage(remoteMessage: any): Promise<void> {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      
      await this.processNotificationData(payload);
      await this.storeNotificationLocally(payload);
    } catch (error) {
      // Error handled silently
    }
  }

  private async handleForegroundMessage(remoteMessage: any): Promise<void> {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      
      await this.processNotificationData(payload);
      this.showInAppNotification(payload);
    } catch (error) {
      // Error handled silently
    }
  }

  private handleNotificationPress(remoteMessage: any): void {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      
      this.navigateBasedOnNotification(payload);
    } catch (error) {
      // Error handled silently
    }
  }

  private parseNotificationPayload(remoteMessage: any): NotificationPayload {
    return {
      type: remoteMessage.data?.type || 'general',
      title: remoteMessage.notification?.title || 'Jaudi Finance',
      body: remoteMessage.notification?.body || '',
      transactionId: remoteMessage.data?.transactionId,
      data: remoteMessage.data || {},
    };
  }

  private async processNotificationData(payload: NotificationPayload): Promise<void> {
    const { updateTransaction, setUser } = useAppStore.getState();
    
    if (!payload.data) {
      return;
    }
    
    switch (payload.type) {
      case 'transaction_update':
        if (payload.transactionId && payload.data.status) {
          updateTransaction(payload.transactionId, {
            status: payload.data.status,
            updatedAt: new Date(),
          });
        }
        break;
        
      case 'kyc_update':
        try {
          const { isOnline } = useAppStore.getState();
          if (isOnline) {
            const userResponse = await apiService.getUser();
            if (userResponse.success) {
              setUser(userResponse.data!);
            }
          }
        } catch (error) {
          // Error handled silently
        }
        break;
        
      case 'security_alert':
        this.handleSecurityAlert(payload);
        break;
    }
  }

  private showInAppNotification(payload: NotificationPayload): void {
    Alert.alert(
      payload.title,
      payload.body,
      [
        {
          text: 'OK',
          onPress: () => this.navigateBasedOnNotification(payload),
        },
      ],
      { cancelable: true }
    );
  }

  private navigateBasedOnNotification(payload: NotificationPayload): void {
    // Navigation logic would be implemented here
  }

  private handleSecurityAlert(payload: NotificationPayload): void {
    Alert.alert(
      'Security Alert',
      payload.body,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ],
      { cancelable: false }
    );
  }

  private async storeNotificationLocally(payload: NotificationPayload): Promise<void> {
    try {
      const notifications = await securityService.getSecureData<NotificationPayload[]>('local_notifications') || [];
      notifications.unshift({
        ...payload,
        data: {
          ...payload.data,
          receivedAt: new Date().toISOString(),
          read: false,
        },
      });
      
      const trimmedNotifications = notifications.slice(0, 100);
      await securityService.storeSecureData('local_notifications', trimmedNotifications);
    } catch (error) {
      // Error handled silently
    }
  }

  async getStoredNotifications(): Promise<NotificationPayload[]> {
    try {
      return await securityService.getSecureData<NotificationPayload[]>('local_notifications') || [];
    } catch (error) {
      return [];
    }
  }

  async markNotificationAsRead(index: number): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      if (notifications[index]) {
        notifications[index].data = {
          ...notifications[index].data,
          read: true,
        };
        await securityService.storeSecureData('local_notifications', notifications);
      }
    } catch (error) {
      // Error handled silently
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await securityService.removeSecureData('local_notifications');
    } catch (error) {
      // Error handled silently
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    // Local notification implementation would go here
  }

  getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const notificationService = new NotificationService();