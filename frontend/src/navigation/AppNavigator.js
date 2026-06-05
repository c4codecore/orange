import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import UploadScreen from '../screens/UploadScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: '#2C2C2E',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#555',
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Feed') {
            return (
              <View style={focused ? styles.activeTab : styles.inactiveTab}>
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={22}
                  color={color}
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            );
          }
          if (route.name === 'Upload') {
            return (
              <LinearGradient
                colors={focused ? ['#FF6B00', '#FF9A3C'] : ['#1C1C1E', '#1C1C1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.uploadTab, focused && styles.uploadTabActive]}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </LinearGradient>
            );
          }
          if (route.name === 'Profile') {
            return (
              <View style={focused ? styles.activeTab : styles.inactiveTab}>
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={22}
                  color={color}
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            );
          }
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuth();
  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B00',
  },
  uploadTab: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#2C2C2E',
  },
  uploadTabActive: {
    borderColor: 'rgba(255, 154, 60, 0.65)',
    shadowColor: '#FF6B00',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
