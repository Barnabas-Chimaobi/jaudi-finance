import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../stores/appStore';
import Button from '../../components/common/Button';
import { securityService } from '../../services/securityService';
import { styles } from './ProfileScreen.styles';

const ProfileScreen: React.FC = () => {
  const { user, logout, setUser } = useAppStore();
  const [biometricEnabled, setBiometricEnabled] = useState(user?.biometricEnabled || false);
  const [loading, setLoading] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    try {
      setLoading(true);
      
      if (value) {
        const isAvailable = await securityService.isBiometricAvailable();
        if (!isAvailable) {
          Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
          return;
        }
        
        await securityService.setupBiometricAuth();
        Alert.alert('Success', 'Biometric authentication has been enabled.');
      } else {
        Alert.alert(
          'Disable Biometric',
          'Are you sure you want to disable biometric authentication?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: () => {
                setBiometricEnabled(false);
                if (user) {
                  setUser({ ...user, biometricEnabled: false });
                }
              },
            },
          ]
        );
        return;
      }
      
      setBiometricEnabled(value);
      if (user) {
        setUser({ ...user, biometricEnabled: value });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update biometric settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {/* KYC Status Badge */}
        <View style={[styles.kycBadge, { backgroundColor: getKYCStatusColor(user.kycStatus) }]}>
          <Icon 
            name={user.kycStatus === 'approved' ? 'checkmark-circle' : user.kycStatus === 'rejected' ? 'close-circle' : 'time'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.kycBadgeText}>{getKYCStatusText(user.kycStatus)}</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Icon name="person-outline" size={20} color="#8E8E93" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user.firstName} {user.lastName}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="mail-outline" size={20} color="#8E8E93" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="call-outline" size={20} color="#8E8E93" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phoneNumber}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="calendar-outline" size={20} color="#8E8E93" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Security Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="finger-print-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>Use fingerprint or face ID to login</Text>
            </View>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={loading}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor={biometricEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="lock-closed-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="shield-checkmark-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>Add an extra layer of security</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Account Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="document-text-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>KYC Documents</Text>
              <Text style={styles.settingDescription}>Manage your verification documents</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="card-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Payment Methods</Text>
              <Text style={styles.settingDescription}>Manage your linked accounts</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="notifications-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage your notification preferences</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="help-circle-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Help Center</Text>
              <Text style={styles.settingDescription}>Get help and support</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="chatbubble-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Contact Support</Text>
              <Text style={styles.settingDescription}>Chat with our support team</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="information-circle-outline" size={20} color="#8E8E93" />
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>About</Text>
              <Text style={styles.settingDescription}>App version and legal information</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          icon={<Icon name="log-out-outline" size={20} color="white" />}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;