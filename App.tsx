import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ConnectionStatusToast } from './src/components/common';
import { useAppStore } from './src/stores/appStore';

const App: React.FC = () => {
  const { initializeApp } = useAppStore();

  useEffect(() => {
    // Initialize app services
    const initialize = async () => {
      try {
        await initializeApp();
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, [initializeApp]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <AppNavigator />
      <ConnectionStatusToast />
    </View>
  );
};

export default App;
