import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function UploadScreen({ navigation }) {
  const { token } = useAuth();
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // Web ke liye file input use karo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setImage({ uri, file, name: file.name, type: file.type });
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Pehle image select karo');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('caption', caption);

    if (Platform.OS === 'web') {
      formData.append('image', image.file);
    } else {
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    }

    const data = await api.createPost(token, formData);
    setLoading(false);

    if (data.id) {
      setImage(null);
      setCaption('');
      navigation.navigate('Feed');
    } else {
      setError(data.detail || 'Upload failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Post</Text>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Image select karo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Caption likho... (optional)"
          placeholderTextColor="#666"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.btn, !image && styles.btnDisabled]}
          onPress={handleUpload}
          disabled={loading || !image}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Post Karo 🍊</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  imagePicker: { width: '100%', aspectRatio: 1, backgroundColor: '#1a1a1a' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 48, marginBottom: 12 },
  placeholderText: { color: '#666', fontSize: 16 },
  form: { padding: 16 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 12,
    padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1,
    borderColor: '#2a2a2a', textAlignVertical: 'top'
  },
  btn: { backgroundColor: '#FF6B00', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#333' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: '#ff4444', textAlign: 'center', marginBottom: 16 },
});