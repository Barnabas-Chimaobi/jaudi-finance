import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { useAppStore } from '../../stores/appStore';

import { cameraService } from '../../services/cameraService';
import { databaseService } from '../../services/databaseService';
import { securityService } from '../../services/securityService';
import { User, KYCDocument } from '../../types';
import { styles } from './RegisterScreen.styles';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
}

interface FormErrors {
  [key: string]: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addToSyncQueue, setUser, setAuthenticated } = useAppStore();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [kycDocuments, setKycDocuments] = useState<{
    idDocument?: string;
    proofOfAddress?: string;
    selfie?: string;
  }>({});

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!kycDocuments.idDocument) {
      newErrors.idDocument = 'ID document photo is required';
    }

    if (!kycDocuments.proofOfAddress) {
      newErrors.proofOfAddress = 'Proof of address is required';
    }

    if (!kycDocuments.selfie) {
      newErrors.selfie = 'Selfie is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openDeviceSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleCaptureDocument = async (documentType: 'idDocument' | 'proofOfAddress' | 'selfie') => {
    try {
      // Check camera permission first
      const hasPermission = await cameraService.requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to capture your KYC documents. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openDeviceSettings }
          ]
        );
        return;
      }

      const options = cameraService.getKYCCameraOptions();
      const result = await cameraService.captureImage(options);
      
      if (result) {
        // Validate image
        const validationResult = cameraService.validateKYCImage(result);
        if (!validationResult.isValid) {
          Alert.alert('Invalid Image', validationResult.errors.join(', '));
          return;
        }

        // Compress image if needed
        const compressedImage = await cameraService.compressImage(result, 500);
        setKycDocuments(prev => ({ ...prev, [documentType]: compressedImage.uri }));
        
        // Clear error if exists
        if (errors[documentType]) {
          setErrors(prev => ({ ...prev, [documentType]: '' }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleNextStep = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      // Create user locally (offline-first approach)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if biometric authentication is available
      const biometricResult = await securityService.isBiometricAvailable();
      const biometricEnabled = biometricResult.available;
      
      const newUser: User = {
        id: userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        kycStatus: 'pending',
        biometricEnabled: biometricEnabled, // Enable biometric if available
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Store user locally
      await databaseService.createUser(newUser);
      
      // Set up biometric authentication if available
      if (biometricEnabled) {
        try {
          // Store credentials for biometric authentication
          await securityService.storeCredentials(formData.email, formData.password);
          
          // Set up biometric keys
          await securityService.setupBiometricAuth();
          
          console.log('Biometric authentication set up successfully');
        } catch (biometricError) {
          console.log('Biometric setup failed, but continuing with registration:', biometricError);
          // Don't fail registration if biometric setup fails
          newUser.biometricEnabled = false;
          await databaseService.updateUser(newUser);
        }
      }
      
      // Add user registration to sync queue
      addToSyncQueue({
        type: 'user',
        action: 'create',
        data: {
          ...newUser,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
      });
      
      // Set user in store
      setUser(newUser);
      setAuthenticated(true);

      // Upload KYC documents
      const kycPromises = Object.entries(kycDocuments).map(async ([type, uri]) => {
        if (uri) {
          const kycDoc: KYCDocument = {
            id: `${userId}_${type}_${Date.now()}`,
            userId: userId,
            type: type === 'idDocument' ? 'national_id' : type === 'proofOfAddress' ? 'utility_bill' : 'passport',
            frontImageUri: uri,
            status: 'pending',
            syncStatus: 'pending',
            uploadedAt: new Date(),
          };

          // Store locally first
          await databaseService.createKYCDocument(kycDoc);
          
          // Add to sync queue
          addToSyncQueue({
          type: 'kyc',
          action: 'create',
          data: kycDoc,
        });
        }
      });

      await Promise.all(kycPromises);

      Alert.alert(
        'Registration Successful',
        biometricEnabled 
          ? 'Your account has been created and biometric authentication is now available for quick login.'
          : 'Your account has been created locally and will be synced when you come online.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Main' as never),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      
      <Input
        label="First Name"
        value={formData.firstName}
        onChangeText={(value) => updateFormData('firstName', value)}
        placeholder="Enter your first name"
        error={errors.firstName}
        required
      />

      <Input
        label="Last Name"
        value={formData.lastName}
        onChangeText={(value) => updateFormData('lastName', value)}
        placeholder="Enter your last name"
        error={errors.lastName}
        required
      />

      <Input
        label="Email Address"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        required
      />

      <Input
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(value) => updateFormData('phoneNumber', value)}
        placeholder="+1234567890"
        keyboardType="phone-pad"
        error={errors.phoneNumber}
        required
      />

      <Input
        label="Password"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        placeholder="Create a strong password"
        secureTextEntry
        error={errors.password}
        required
      />

      <Input
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
        required
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Information</Text>
      
      <Input
        label="Date of Birth"
        value={formData.dateOfBirth}
        onChangeText={(value) => updateFormData('dateOfBirth', value)}
        placeholder="YYYY-MM-DD"
        error={errors.dateOfBirth}
        required
      />

      <Input
        label="Address"
        value={formData.address}
        onChangeText={(value) => updateFormData('address', value)}
        placeholder="Enter your full address"
        error={errors.address}
        required
      />

      <Input
        label="City"
        value={formData.city}
        onChangeText={(value) => updateFormData('city', value)}
        placeholder="Enter your city"
        error={errors.city}
        required
      />

      <Input
        label="Country"
        value={formData.country}
        onChangeText={(value) => updateFormData('country', value)}
        placeholder="Enter your country"
        error={errors.country}
        required
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>KYC Documents</Text>
      <Text style={styles.stepSubtitle}>
        Please upload clear photos of your documents
      </Text>
      
      <View style={styles.documentSection}>
        <Text style={styles.documentLabel}>ID Document *</Text>
        <Button
          title={kycDocuments.idDocument ? 'Retake Photo' : 'Capture ID Document'}
          onPress={() => handleCaptureDocument('idDocument')}
          variant={kycDocuments.idDocument ? 'secondary' : 'outline'}
          style={styles.documentButton}
        />
        {errors.idDocument && (
          <Text style={styles.errorText}>{errors.idDocument}</Text>
        )}
      </View>

      <View style={styles.documentSection}>
        <Text style={styles.documentLabel}>Proof of Address *</Text>
        <Button
          title={kycDocuments.proofOfAddress ? 'Retake Photo' : 'Capture Proof of Address'}
          onPress={() => handleCaptureDocument('proofOfAddress')}
          variant={kycDocuments.proofOfAddress ? 'secondary' : 'outline'}
          style={styles.documentButton}
        />
        {errors.proofOfAddress && (
          <Text style={styles.errorText}>{errors.proofOfAddress}</Text>
        )}
      </View>

      <View style={styles.documentSection}>
        <Text style={styles.documentLabel}>Selfie *</Text>
        <Button
          title={kycDocuments.selfie ? 'Retake Selfie' : 'Take Selfie'}
          onPress={() => handleCaptureDocument('selfie')}
          variant={kycDocuments.selfie ? 'secondary' : 'outline'}
          style={styles.documentButton}
        />
        {errors.selfie && (
          <Text style={styles.errorText}>{errors.selfie}</Text>
        )}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Step {currentStep} of 3
            </Text>
            
            <View style={styles.progressBar}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.progressStep,
                    step <= currentStep ? styles.progressStepActive : null,
                  ]}
                />
              ))}
            </View>
          </View>

          <ConnectionStatus 
            showSyncButton={false}
            showPendingCount={false}
            compact={false}
            autoHide={true}
            autoHideDuration={8000}
            showOnlyOnChange={true}
          />

          {renderCurrentStep()}

          <View style={styles.actions}>
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handlePrevStep}
                variant="outline"
                style={styles.actionButton}
              />
            )}
            
            <Button
              title={currentStep === 3 ? (isLoading ? 'Creating Account...' : 'Create Account') : 'Next'}
              onPress={handleNextStep}
              disabled={isLoading}
              loading={isLoading}
              style={[styles.actionButton, styles.primaryButton]}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                title="Sign In"
                onPress={navigateToLogin}
                variant="ghost"
                style={styles.loginButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <LoadingSpinner
          overlay
          size="large"
        />
      )}
    </SafeAreaView>
  );
};

export default RegisterScreen;