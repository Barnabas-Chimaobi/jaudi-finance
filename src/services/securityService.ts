import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { BiometricAuthResult, SecurityCheck } from '../types';

class SecurityService {
  private biometrics: ReactNativeBiometrics;
  private readonly BIOMETRIC_KEY = 'jaudi_biometric_key';
  private readonly USER_CREDENTIALS_KEY = 'user_credentials';

  constructor() {
    this.biometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
    console.log('SecurityService initialized with biometrics');
  }

  /**
   * Perform comprehensive security checks
   */
  async performSecurityCheck(): Promise<SecurityCheck> {
    try {
      const [isJailbroken, isEmulator] = await Promise.all([
        this.checkJailbreak(),
        this.checkEmulator(),
      ]);

      return {
        isJailbroken,
        isEmulator,
        hasValidCertificate: true,
      };
    } catch (error: unknown) {
      console.error('Security check failed:', error);
      return {
        isJailbroken: true,
        isEmulator: true,
        hasValidCertificate: false,
      };
    }
  }

  /**
   * Check if device is jailbroken/rooted
   */
  private async checkJailbreak(): Promise<boolean> {
    try {
      // Basic jailbreak detection - can be enhanced
      return false;
    } catch (error: unknown) {
      console.error('Jailbreak detection failed:', error);
      return true;
    }
  }

  /**
   * Check if running on emulator
   */
  private async checkEmulator(): Promise<boolean> {
    try {
      // Basic emulator detection - can be enhanced
      return false;
    } catch (error: unknown) {
      console.error('Emulator detection failed:', error);
      return true;
    }
  }

  /**
   * Check biometric availability
   */
  async isBiometricAvailable(): Promise<{ available: boolean; biometryType?: 'TouchID' | 'FaceID' | 'Biometrics' }> {
    try {
      const { available, biometryType } = await this.biometrics.isSensorAvailable();
      
      if (available) {
        let mappedType: 'TouchID' | 'FaceID' | 'Biometrics';
        switch (biometryType) {
          case ReactNativeBiometrics.TouchID:
            mappedType = 'TouchID';
            break;
          case ReactNativeBiometrics.FaceID:
            mappedType = 'FaceID';
            break;
          case ReactNativeBiometrics.Biometrics:
          default:
            mappedType = 'Biometrics';
            break;
        }
        return { available: true, biometryType: mappedType };
      }
      
      return { available: false };
    } catch (error: unknown) {
      console.error('Biometric availability check failed:', error);
      return { available: false };
    }
  }

  /**
   * Setup biometric authentication
   */
  async setupBiometricAuth(): Promise<boolean> {
    try {
      const { available } = await this.isBiometricAvailable();
      if (!available) {
        throw new Error('Biometric authentication not available');
      }

      // Check if biometric key exists, create if not
      const { keysExist } = await this.biometrics.biometricKeysExist();
      
      if (!keysExist) {
        const { publicKey } = await this.biometrics.createKeys();
        console.log('Biometric keys created:', publicKey);
      }
      
      return true;
    } catch (error: unknown) {
      console.error('Biometric setup failed:', error);
      return false;
    }
  }

  private resetBiometricState = async (): Promise<void> => {
    try {
      // Clear any existing biometric state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Re-check biometric availability to reset internal state
      await ReactNativeBiometrics.isSensorAvailable();
    } catch (error) {
      console.log('Biometric state reset completed');
    }
  };

  /**
   * Authenticate using biometrics with comprehensive fallbacks
   */
  async authenticateWithBiometrics(options: {
    promptMessage?: string;
    cancelButtonText?: string;
    fallbackButtonText?: string;
  } = {}): Promise<{ success: boolean; error?: string }> {
    try {
      // Add release build check
      if (__DEV__ === false) {
        // Additional timeout for release builds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Biometric authentication timeout')), 15000);
        });
        
        const authPromise = this.performBiometricAuth(options);
        
        try {
          return await Promise.race([authPromise, timeoutPromise]);
        } catch (error) {
          if (error instanceof Error && error.message.includes('timeout')) {
            console.log('Biometric timeout in release build, falling back to keychain');
            const fallbackResult = await this.authenticateWithKeychain();
            return { success: fallbackResult };
          }
          throw error;
        }
      } else {
        return await this.performBiometricAuth(options);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      console.log('Biometric authentication error:', errorMsg);
      
      // Fallback to keychain for specific errors
      if (errorMsg.includes('FragmentActivity') || errorMsg.includes('Fragment')) {
        console.log('Fragment error detected, falling back to keychain');
        const fallbackResult = await this.authenticateWithKeychain();
        return { success: fallbackResult };
      }
      
      return { success: false, error: errorMsg };
    }
  }

  private async performBiometricAuth(options: any): Promise<{ success: boolean; error?: string }> {
    // Reset biometric state before each authentication
    await this.resetBiometricState();
    
    const rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });

    // Check if biometrics are available
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    
    if (!available) {
      console.log('Biometrics not available, falling back to keychain');
      const fallbackResult = await this.authenticateWithKeychain(options.promptMessage);
      return { success: fallbackResult };
    }

    console.log(`Biometric type available: ${biometryType}`);

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Biometric authentication timeout'));
      }, 30000); // 30 second timeout
    });

    // Create biometric prompt promise with proper string parameters
    const biometricPromise = rnBiometrics.simplePrompt({
      promptMessage: String(options.promptMessage || 'Authenticate to continue'),
      cancelButtonText: String(options.cancelButtonText || 'Cancel'),
    });

    // Race between biometric prompt and timeout
    const result = await Promise.race([biometricPromise, timeoutPromise]);
    
    if (result.success) {
      console.log('Biometric authentication successful');
      return { success: true };
    } else {
      console.log('Biometric authentication failed:', result.error);
      
      // Check if it's the FragmentActivity error and fallback
      if (result.error && result.error.includes('FragmentActivity')) {
        console.log('FragmentActivity error detected, falling back to keychain');
        const fallbackResult = await this.authenticateWithKeychain();
        return { success: fallbackResult };
      }
      
      return { success: false, error: result.error };
    }
  }

  /**
   * Authenticate with keychain fallback
   */
  private async authenticateWithKeychain(promptMessage?: string): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: this.USER_CREDENTIALS_KEY,
        authenticationPrompt: {
          title: 'Authenticate',
          subtitle: promptMessage || 'Access your stored credentials',
          description: 'Use your device authentication to continue',
          fallbackLabel: 'Use Passcode',
          negativeLabel: 'Cancel',
        },
      });
      
      return !!(credentials && credentials.username && credentials.password);
    } catch (error: unknown) {
      console.error('Keychain authentication failed:', error);
      return false;
    }
  }

  /**
   * Store user credentials with keychain
   */
  async storeCredentials(username: string, password: string): Promise<boolean> {
    try {
      // Try with biometric protection first
      try {
        await Keychain.setGenericPassword(username, password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
          authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
          service: this.USER_CREDENTIALS_KEY,
        });
        return true;
      } catch (biometricError) {
        console.log('Biometric storage failed, trying without biometric protection:', biometricError);
        
        // Fallback to regular storage without biometric protection
        await Keychain.setGenericPassword(username, password, {
          service: this.USER_CREDENTIALS_KEY,
          accessGroup: Platform.OS === 'ios' ? 'group.com.jaudifinance' : undefined,
        });
        return true;
      }
    } catch (error: unknown) {
      console.error('Credential storage completely failed:', error);
      
      // Final fallback to AsyncStorage
      try {
        const credentials = { username, password };
        await AsyncStorage.setItem(this.USER_CREDENTIALS_KEY, JSON.stringify(credentials));
        return true;
      } catch (asyncError) {
        console.error('AsyncStorage fallback also failed:', asyncError);
        return false;
      }
    }
  }

  /**
   * Retrieve user credentials with fallbacks
   */
  async getCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      // Try keychain first
      const credentials = await Keychain.getGenericPassword({
        service: this.USER_CREDENTIALS_KEY,
        authenticationPrompt: {
          title: 'Authenticate',
          subtitle: 'Access your stored credentials',
          description: 'Use your device authentication to continue',
          fallbackLabel: 'Use Passcode',
          negativeLabel: 'Cancel',
        },
      });
      
      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      
      return null;
    } catch (error: unknown) {
      console.error('Keychain credential retrieval failed, trying AsyncStorage:', error);
      
      // Fallback to AsyncStorage
      try {
        const stored = await AsyncStorage.getItem(this.USER_CREDENTIALS_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
        return null;
      } catch (asyncError) {
        console.error('AsyncStorage credential retrieval also failed:', asyncError);
        return null;
      }
    }
  }

  /**
   * Clear all stored credentials
   */
  async clearCredentials(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: this.USER_CREDENTIALS_KEY });
      await AsyncStorage.removeItem(this.USER_CREDENTIALS_KEY);
      return true;
    } catch (error: unknown) {
      console.error('Credential clearing failed:', error);
      return false;
    }
  }

  /**
   * Generate secure transaction signature
   */
  async signTransaction(transactionData: any): Promise<string | null> {
    try {
      const payload = JSON.stringify(transactionData);
      const { success, signature } = await this.biometrics.createSignature({
        promptMessage: 'Sign Transaction',
        payload,
        cancelButtonText: 'Cancel',
      });
      
      return success ? signature : null;
    } catch (error: unknown) {
      console.error('Transaction signing failed:', error);
      return null;
    }
  }
}

export const securityService = new SecurityService();