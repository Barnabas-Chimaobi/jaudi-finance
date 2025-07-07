import { Transaction, KYCDocument, User, ExchangeRate } from '../types';
import { securityService } from './securityService';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl = 'https://api.jaudifinance.com'; // Replace with actual API URL
  private timeout = 30000; // 30 seconds

  /**
   * Generic API request handler
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const token = await securityService.getSecureData<string>('auth_token');
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        timeout: this.timeout,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error.message || 'Network request failed',
      };
    }
  }

  /**
   * Authentication
   */
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * User management
   */
  async getUser(): Promise<ApiResponse<User>> {
    return this.request('/user/profile');
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * KYC Document management
   */
  async uploadKYCDocument(document: KYCDocument): Promise<ApiResponse<KYCDocument>> {
    const formData = new FormData();
    
    // Add document metadata
    formData.append('type', document.type);
    formData.append('userId', document.userId);
    
    // Add front image
    formData.append('frontImage', {
      uri: document.frontImageUri,
      type: 'image/jpeg',
      name: `front_${document.id}.jpg`,
    } as any);
    
    // Add back image if exists
    if (document.backImageUri) {
      formData.append('backImage', {
        uri: document.backImageUri,
        type: 'image/jpeg',
        name: `back_${document.id}.jpg`,
      } as any);
    }

    return this.request('/kyc/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  async getKYCDocuments(): Promise<ApiResponse<KYCDocument[]>> {
    return this.request('/kyc/documents');
  }

  async getKYCStatus(): Promise<ApiResponse<{ status: string; documents: KYCDocument[] }>> {
    return this.request('/kyc/status');
  }

  /**
   * Transaction management
   */
  async createTransaction(transaction: Transaction): Promise<ApiResponse<Transaction>> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async getTransactions(page = 1, limit = 20): Promise<ApiResponse<{
    transactions: Transaction[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return this.request(`/transactions?page=${page}&limit=${limit}`);
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async cancelTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Exchange rates
   */
  async getExchangeRates(): Promise<ApiResponse<ExchangeRate[]>> {
    return this.request('/exchange-rates');
  }

  async getCybridRate(fromCurrency: string, toCurrency: string): Promise<ApiResponse<{
    rate: number;
    timestamp: Date;
    source: 'cybrid';
  }>> {
    // Mock Cybrid rate fetch - replace with actual Cybrid API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRate = {
          rate: 1.2345 + (Math.random() - 0.5) * 0.1, // Mock fluctuation
          timestamp: new Date(),
          source: 'cybrid' as const,
        };
        
        resolve({
          success: true,
          data: mockRate,
        });
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Notifications
   */
  async registerFCMToken(token: string): Promise<ApiResponse> {
    return this.request('/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ fcmToken: token }),
    });
  }

  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<{
    notifications: any[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: Date }>> {
    return this.request('/health');
  }

  /**
   * Batch operations for sync
   */
  async batchSync(operations: {
    transactions?: Transaction[];
    kycDocuments?: KYCDocument[];
    userUpdates?: Partial<User>;
  }): Promise<ApiResponse<{
    transactions: Transaction[];
    kycDocuments: KYCDocument[];
    user?: User;
  }>> {
    return this.request('/sync/batch', {
      method: 'POST',
      body: JSON.stringify(operations),
    });
  }

  /**
   * Get server timestamp for sync purposes
   */
  async getServerTime(): Promise<ApiResponse<{ timestamp: Date }>> {
    return this.request('/time');
  }

  /**
   * Upload file helper
   */
  async uploadFile(file: {
    uri: string;
    type: string;
    name: string;
  }, endpoint: string): Promise<ApiResponse<{ url: string; fileId: string }>> {
    const formData = new FormData();
    formData.append('file', file as any);

    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    await securityService.storeSecureData('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken(): Promise<void> {
    await securityService.removeSecureData('auth_token');
  }
}

export const apiService = new ApiService();