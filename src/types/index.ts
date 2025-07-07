// Core type definitions for the remittance app

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  biometricEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  fee: number;
  totalAmount: number;
  status: 'created' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill';
  frontImageUri: string;
  backImageUri?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: Date;
}

export interface AppState {
  isOnline: boolean;
  isAuthenticated: boolean;
  user: User | null;
  transactions: Transaction[];
  kycDocuments: KYCDocument[];
  exchangeRates: ExchangeRate[];
  syncQueue: SyncItem[];
}

export interface SyncItem {
  id: string;
  type: 'transaction' | 'kyc' | 'user' | 'notification';
  action: 'create' | 'update' | 'delete' | 'register_token';
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: 'TouchID' | 'FaceID' | 'Biometrics';
  signature?: string;
}

export interface SecurityCheck {
  isJailbroken: boolean;
  isEmulator: boolean;
  hasValidCertificate: boolean;
}

export interface NotificationPayload {
  transactionId?: string;
  type: 'transaction_update' | 'kyc_update' | 'security_alert';
  title: string;
  body: string;
  data?: Record<string, any>;
}