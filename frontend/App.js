import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <AuthProvider>
        <View style={styles.webContainer}>
          <View style={styles.webApp}>
            <AppNavigator />
          </View>
        </View>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webApp: {
    width: 590,
    height: '100vh',
    overflow: 'hidden',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: '#2C2C2E',
  },
});