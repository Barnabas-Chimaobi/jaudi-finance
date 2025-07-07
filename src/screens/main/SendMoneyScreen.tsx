import React, { useState, useEffect, useCallback } from 'react';
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
import { Button, Input, LoadingSpinner, BiometricPrompt, ConnectionStatus } from '../../components/common';
import { useAppStore } from '../../stores/appStore';
import { apiService } from '../../services/apiService';

import { databaseService } from '../../services/databaseService';
import { Transaction, BiometricAuthResult } from '../../types';
import { styles } from './SendMoneyScreen.styles';

interface SendMoneyForm {
  recipientPhone: string;
  recipientName: string;
  amount: string;
  currency: string;
  description: string;
}

interface ExchangeRateInfo {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
  fees: number;
  totalAmount: number;
}

// Default exchange rates for offline functionality
const DEFAULT_EXCHANGE_RATES: { [key: string]: number } = {
  'USD': 22.50,  // 1 USD = 22.50 SLE (Sierra Leone Leone)
  'EUR': 24.75,  // 1 EUR = 24.75 SLE
  'GBP': 28.90,  // 1 GBP = 28.90 SLE
  'SLE': 1.00,   // 1 SLE = 1 SLE
};

const SendMoneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    isOnline,
    user,
    addToSyncQueue,
    updateTransaction, // Add this import
  } = useAppStore();
  
  const [formData, setFormData] = useState<SendMoneyForm>({
    recipientPhone: '',
    recipientName: '',
    amount: '',
    currency: 'USD',
    description: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateInfo | null>(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [usingDefaultRates, setUsingDefaultRates] = useState(false);

  const availableCurrencies = ['USD', 'EUR', 'GBP', 'SLE']; // Sierra Leone Leone

  useEffect(() => {
    if (formData.amount && parseFloat(formData.amount) > 0) {
      fetchExchangeRate();
    } else {
      setExchangeRate(null);
    }
  }, [formData.amount, formData.currency, fetchExchangeRate]);

  const calculateExchangeRate = useCallback((rate: number, isDefault = false) => {
    const amount = parseFloat(formData.amount);
    const convertedAmount = amount * rate;
    const fees = amount * 0.02; // 2% fee
    const totalAmount = amount + fees;

    setExchangeRate({
      fromCurrency: formData.currency,
      toCurrency: 'SLE',
      rate,
      convertedAmount,
      fees,
      totalAmount,
    });
    
    setUsingDefaultRates(isDefault);
  }, [formData.amount, formData.currency]);

  const getDefaultExchangeRate = useCallback((currency: string): number => {
    return DEFAULT_EXCHANGE_RATES[currency] || 1.0;
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    setIsLoadingRates(true);
    
    try {
      if (isOnline) {
        // Try to fetch from API first when online
        try {
          const response = await apiService.getExchangeRates(formData.currency, 'SLE');
          if (response.success && response.data) {
            const rate = response.data.rate;
            calculateExchangeRate(rate, false);
            
            // Cache the rate locally
            await databaseService.createExchangeRate({
              fromCurrency: formData.currency,
              toCurrency: 'SLE',
              rate,
              timestamp: new Date(),
            });
            return;
          }
        } catch (apiError) {
          console.log('API fetch failed, trying cached rates:', apiError);
        }
      }
      
      // Try cached rates (both online and offline)
      try {
        const cachedRates = await databaseService.getExchangeRates(formData.currency, 'SLE');
        if (cachedRates.length > 0) {
          const rate = cachedRates[0];
          calculateExchangeRate(rate.rate, false);
          return;
        }
      } catch (cacheError) {
        console.log('No cached rates available:', cacheError);
      }
      
      // Fallback to default rates
      const defaultRate = getDefaultExchangeRate(formData.currency);
      calculateExchangeRate(defaultRate, true);
      
      // Store default rate in cache for future use
      try {
        await databaseService.createExchangeRate({
          fromCurrency: formData.currency,
          toCurrency: 'SLE',
          rate: defaultRate,
          timestamp: new Date(),
        });
      } catch (storeError) {
        console.log('Failed to store default rate:', storeError);
      }
      
    } finally {
      setIsLoadingRates(false);
    }
  }, [isOnline, formData.currency, calculateExchangeRate, getDefaultExchangeRate]);

  const updateFormData = (field: keyof SendMoneyForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = 'Recipient phone is required';
    } else if (!/^[+]?[1-9]\d{1,14}$/.test(formData.recipientPhone.replace(/[\s-]/g, ''))) {
      newErrors.recipientPhone = 'Please enter a valid phone number';
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Recipient name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (amount < 1) {
        newErrors.amount = 'Minimum amount is 1.00';
      } else if (amount > 10000) {
        newErrors.amount = 'Maximum amount is 10,000.00';
      }
    }

    if (!formData.currency) {
      newErrors.currency = 'Please select a currency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createTransaction = (): Transaction => {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: transactionId,
      userId: user?.id || '',
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      exchangeRate: exchangeRate?.rate || 1,
      fee: exchangeRate?.fees || 0,
      totalAmount: exchangeRate?.totalAmount || parseFloat(formData.amount),
      status: 'created',
      reference: transactionId,
      description: formData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: isOnline ? 'synced' : 'pending',
    };
  };

  const handleSendMoney = async () => {
    console.log('Send money button clicked');
    console.log('Form data:', formData);
    console.log('Exchange rate:', exchangeRate);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Form errors:', errors);
    
    if (!isValid) {
      // Show alert to user about validation errors
      const errorMessages = Object.values(errors).filter(error => error.length > 0);
      Alert.alert(
        'Please Fix the Following Issues',
        errorMessages.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    const transaction = createTransaction();
    console.log('Created transaction:', transaction);
    setPendingTransaction(transaction);
    setShowBiometricPrompt(true);
    console.log('Biometric prompt should show now');
  };

  const onBiometricSuccess = async (_result: BiometricAuthResult) => {
    setShowBiometricPrompt(false);
    
    if (!pendingTransaction) return;
  
    setIsLoading(true);
    
    try {
      // Store transaction locally first
      await databaseService.createTransaction(pendingTransaction);
      console.log('Transaction created locally:', pendingTransaction.id);
      
      if (isOnline) {
        // Process immediately if online (local processing only, no API)
        await databaseService.updateTransaction(pendingTransaction.id, {
          status: 'completed', // Directly mark as completed when online
          syncStatus: 'synced',
          updatedAt: new Date(),
        });
        
        // Update in app store as well
        updateTransaction(pendingTransaction.id, {
          status: 'completed',
          syncStatus: 'synced',
          updatedAt: new Date(),
        });
        
        Alert.alert(
          'Transaction Completed',
          'Your money transfer has been completed successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // For offline processing
        await databaseService.updateTransaction(pendingTransaction.id, {
          status: 'processing',
          syncStatus: 'pending',
          updatedAt: new Date(),
        });
        
        addToSyncQueue({
          type: 'transaction',
          action: 'create',
          data: { ...pendingTransaction, status: 'processing' },
        });
        
        Alert.alert(
          'Transaction Saved',
          'Your transaction has been saved offline and will be processed when you reconnect to the internet.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Transaction processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process transaction';
      Alert.alert('Transaction Failed', errorMessage);
    } finally {
      setIsLoading(false);
      setPendingTransaction(null);
    }
  };

  const onBiometricError = (error: string) => {
    setShowBiometricPrompt(false);
    setPendingTransaction(null);
    Alert.alert('Authentication Failed', error);
  };

  const onBiometricCancel = () => {
    setShowBiometricPrompt(false);
    setPendingTransaction(null);
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
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
            <Text style={styles.title}>Send Money</Text>
            <Text style={styles.subtitle}>Send money worldwide</Text>
          </View>

          <ConnectionStatus
            showSyncButton={false}
            showPendingCount={true}
            compact={false}
            autoHide={true}
            autoHideDuration={6000}
            showOnlyOnChange={true}
          />

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recipient Details</Text>
              
              <Input
                label="Recipient Phone"
                value={formData.recipientPhone}
                onChangeText={(value) => updateFormData('recipientPhone', value)}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.recipientPhone}
                required
              />

              <Input
                label="Recipient Name"
                value={formData.recipientName}
                onChangeText={(value) => updateFormData('recipientName', value)}
                placeholder="Full name of recipient"
                error={errors.recipientName}
                required
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transfer Details</Text>
              
              <Input
                label="Amount"
                value={formData.amount}
                onChangeText={(value) => updateFormData('amount', value)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={errors.amount}
                required
              />

              <View style={styles.currencyContainer}>
                <Text style={styles.currencyLabel}>Currency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.currencyOptions}>
                    {availableCurrencies.map((currency) => (
                      <Button
                        key={currency}
                        title={currency}
                        onPress={() => updateFormData('currency', currency)}
                        variant={formData.currency === currency ? 'primary' : 'outline'}
                        size="small"
                        style={styles.currencyButton}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Input
                label="Description (Optional)"
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                placeholder="What's this for?"
                multiline
                numberOfLines={3}
              />
            </View>

            {exchangeRate && (
              <View style={styles.exchangeRateCard}>
                <View style={styles.exchangeRateHeader}>
                  <Text style={styles.exchangeRateTitle}>Exchange Rate Summary</Text>
                  {usingDefaultRates && (
                    <Text style={styles.defaultRateWarning}>Using offline rates</Text>
                  )}
                </View>
                
                {isLoadingRates ? (
                  <View style={styles.loadingContainer}>
                    <LoadingSpinner size="small" />
                    <Text style={styles.loadingText}>Fetching latest rates...</Text>
                  </View>
                ) : (
                  <View style={styles.exchangeRateDetails}>
                    <View style={styles.exchangeRateRow}>
                      <Text style={styles.exchangeRateLabel}>Amount:</Text>
                      <Text style={styles.exchangeRateValue}>
                        {formatCurrency(parseFloat(formData.amount), formData.currency)}
                      </Text>
                    </View>
                    
                    <View style={styles.exchangeRateRow}>
                      <Text style={styles.exchangeRateLabel}>Exchange Rate:</Text>
                      <Text style={styles.exchangeRateValue}>
                        1 {formData.currency} = {exchangeRate.rate.toFixed(4)} SLE
                        {usingDefaultRates && <Text style={styles.offlineIndicator}> (offline)</Text>}
                      </Text>
                    </View>
                    
                    <View style={styles.exchangeRateRow}>
                      <Text style={styles.exchangeRateLabel}>Recipient Gets:</Text>
                      <Text style={styles.exchangeRateValue}>
                        {formatCurrency(exchangeRate.convertedAmount, 'SLE')}
                      </Text>
                    </View>
                    
                    <View style={styles.exchangeRateRow}>
                      <Text style={styles.exchangeRateLabel}>Fees:</Text>
                      <Text style={styles.exchangeRateValue}>
                        {formatCurrency(exchangeRate.fees, formData.currency)}
                      </Text>
                    </View>
                    
                    <View style={[styles.exchangeRateRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(exchangeRate.totalAmount, formData.currency)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              title={isLoading ? 'Processing...' : 'Send Money'}
              onPress={handleSendMoney}
              disabled={isLoading || !exchangeRate || isLoadingRates}
              loading={isLoading}
              fullWidth
              style={styles.sendButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BiometricPrompt
        visible={showBiometricPrompt}
        title="Confirm Transaction"
        subtitle="Authenticate to send money"
        description={`Confirm sending ${formatCurrency(parseFloat(formData.amount), formData.currency)} to ${formData.recipientName}`}
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

export default SendMoneyScreen;