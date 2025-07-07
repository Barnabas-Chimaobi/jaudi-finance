import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BiometricPrompt from '../../components/common/BiometricPrompt';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useAppStore } from '../../stores/appStore';
import { securityService } from '../../services/securityService';
import { apiService } from '../../services/apiService';
import { databaseService } from '../../services/databaseService';
import { BiometricAuthResult } from '../../types';
import { styles } from './LoginScreen.styles';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, setAuthenticated, isOnline } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{email: string} | null>(null);
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  useEffect(() => {
    checkBiometricAvailability();
    checkSavedCredentials();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const result = await securityService.isBiometricAvailable();
      setBiometricAvailable(result.available);
      
      // Also check if user has saved credentials
      const credentials = await securityService.getCredentials();
      if (credentials) {
        setSavedCredentials({ email: credentials.username });
        setEmail(credentials.username);
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
    }
  };

  const checkSavedCredentials = async () => {
    try {
      const credentials = await securityService.getCredentials();
      if (credentials) {
        setSavedCredentials({ email: credentials?.username });
        setEmail(credentials.username);
      }
    } catch (error) {
      console.log('No saved credentials found');
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      general: '',
    };

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      // First check local database for user (offline-first approach)
      const localUser = await databaseService.getUserByEmail(email);
      
      if (localUser) {
        // For demo purposes, we'll accept any password for local users
        // In production, i will hash and verify passwords properly
        
        const userData = {
          id: localUser.userId,
          email: localUser.email,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          phoneNumber: localUser.phoneNumber,
          kycStatus: localUser.kycStatus,
          biometricEnabled: localUser.biometricEnabled,
          createdAt: localUser.createdAt,
          updatedAt: localUser.updatedAt,
        };

        // Save credentials for biometric auth
        await securityService.storeCredentials(email, password);

        // Update app state
        setUser(userData);
        setAuthenticated(true);

        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      } else {
        // If online, try to login via API and sync user data
        if (isOnline) {
          const response = await apiService.login(email, password);
          
          if (response.success && response.data) {
            // Store user locally for offline access
            await databaseService.createUser({
              ...response.data.user,
              kycStatus: (response.data.user.kycStatus as 'pending' | 'approved' | 'rejected') || 'pending'
            });
            
            // Save credentials for biometric auth
            await securityService.storeCredentials(email, password);

            // Update app state with properly typed user
            setUser({
              ...response.data.user,
              kycStatus: (response.data.user.kycStatus as 'pending' | 'approved' | 'rejected') || 'pending'
            });
            setAuthenticated(true);

            // Navigate to main app
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' as never }],
            });
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } else {
          throw new Error('No local account found. Please connect to internet to login for the first time.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    if (!biometricAvailable || !savedCredentials) {
      Alert.alert(
        'Biometric Login Unavailable',
        'Please log in with your email and password first to enable biometric authentication.'
      );
      return;
    }
    setShowBiometricPrompt(true);
  };

  const onBiometricSuccess = async (_result: BiometricAuthResult) => {
    setShowBiometricPrompt(false);
    
    try {
      const credentials = await securityService.getCredentials();
      if (credentials) {
        setEmail(credentials.username);
        setPassword(credentials.password);
        
        // Auto-login with stored credentials
        setTimeout(() => {
          handleLogin();
        }, 500);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retrieve stored credentials');
    }
  };

  const onBiometricError = (error: string) => {
    setShowBiometricPrompt(false);
    
    // Handle specific biometric errors
    if (error.includes('FragmentActivity') || error.includes('Fragment')) {
      Alert.alert(
        'Biometric Error', 
        'Biometric authentication is temporarily unavailable. Please use email and password to login.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally disable biometric for this session
              setBiometricAvailable(false);
            }
          }
        ]
      );
    } else {
      Alert.alert('Authentication Failed', error);
    }
  };

  const onBiometricCancel = () => {
    setShowBiometricPrompt(false);
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your JaudiFinance account
            </Text>
          </View>

          <ConnectionStatus 
            showSyncButton={false}
            showPendingCount={false}
            compact={false}
            autoHide={true}
            autoHideDuration={8000}
            showOnlyOnChange={true}
          />

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              required
            />

            {errors.general ? (
              <Text style={styles.errorText}>{errors.general}</Text>
            ) : null}

            <Button
              title={isLoading ? 'Signing In...' : 'Sign In'}
              onPress={handleLogin}
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {biometricAvailable && savedCredentials && (
            <Button
              title="Login with Biometrics"
              onPress={handleBiometricLogin}
              variant="outline"
              style={styles.biometricButton}
              icon={<Icon name="finger-print" size={20} color="#007AFF" />}
            />
            )}
          </View>

          <View style={styles.footer}>
            <Button
              title="Forgot Password?"
              onPress={navigateToForgotPassword}
              variant="ghost"
              style={styles.linkButton}
            />
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <Button
                title="Sign Up"
                onPress={navigateToRegister}
                variant="ghost"
                style={styles.registerButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BiometricPrompt
        visible={showBiometricPrompt}
        title="Sign In"
        subtitle="Use your biometric to sign in"
        description="Authenticate to access your JaudiFinance account"
        onSuccess={onBiometricSuccess}
        onError={onBiometricError}
        onCancel={onBiometricCancel}
      />

      {isLoading && (
        <LoadingSpinner
          overlay
          size="large"
        />
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;