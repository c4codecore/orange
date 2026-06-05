import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) { setError('Sab fields bharo'); return; }
    setLoading(true);
    setError('');
    const result = await register(username, email, password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Register failed');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View style={styles.logoSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🍊</Text>
        </View>
        <Text style={styles.appName}>ORANGE</Text>
        <Text style={styles.tagline}>join the community</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="@username"
            placeholderTextColor="#555"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={['#FF6B00', '#FF9A3C']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.btnGradient}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Account Banao</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ya</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.outlineBtnText}>Pehle se account hai? Login karo</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0F0F0F',
    justifyContent: 'center', padding: 24,
  },
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#FF6B00', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '700',
    letterSpacing: 4, marginBottom: 6,
  },
  tagline: { color: '#ABABAB', fontSize: 13 },
  form: { gap: 12 },
  inputWrapper: { gap: 6 },
  inputLabel: { color: '#ABABAB', fontSize: 12, fontWeight: '500', marginLeft: 4 },
  input: {
    backgroundColor: '#1C1C1E', color: '#FFFFFF',
    borderRadius: 14, padding: 16, fontSize: 15,
    borderWidth: 0.5, borderColor: '#2C2C2E',
  },
  btn: {
    borderRadius: 14, marginTop: 4, overflow: 'hidden',
    shadowColor: '#FF6B00', shadowOpacity: 0.28, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  btnGradient: { padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: '#2C2C2E' },
  dividerText: { color: '#555', fontSize: 12 },
  outlineBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#2C2C2E',
  },
  outlineBtnText: { color: '#ABABAB', fontWeight: '600', fontSize: 15 },
  error: { color: '#FF4444', textAlign: 'center', fontSize: 13 },
});
