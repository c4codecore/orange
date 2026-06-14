import React from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function Root() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#FF6B00" size="large" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webApp}>
          <AppNavigator />
        </View>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webApp: {
    width: '100%',
    maxWidth: 480,
    height: '100vh',
    overflow: 'hidden',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#2C2C2E',
  },
});