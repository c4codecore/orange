
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Sab fields bharo');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(username, email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Register failed');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>🍊 Orange</Text>
      <Text style={styles.tagline}>Join the community</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Pehle se account hai? <Text style={styles.linkBold}>Login karo</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  tagline: { color: '#888', textAlign: 'center', marginBottom: 40, fontSize: 16 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a'
  },
  btn: {
    backgroundColor: '#FF6B00', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 16
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: '#ff4444', textAlign: 'center', marginBottom: 16 },
  link: { color: '#888', textAlign: 'center' },
  linkBold: { color: '#FF6B00', fontWeight: 'bold' },
});