import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Platform, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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
      if (!result.canceled) setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) { setError('Pehle image select karo'); return; }
    if (caption.length > 500) { setError('Caption 500 characters se zyada nahi ho sakta'); return; }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('caption', caption);

    if (Platform.OS === 'web') {
      formData.append('image', image.file);
    } else {
      formData.append('image', { uri: image.uri, type: 'image/jpeg', name: 'photo.jpg' });
    }

    const data = await api.createPost(token, formData);
    setLoading(false);

    if (data.id) {
      setImage(null);
      setCaption('');
      navigation.navigate('Feed', { refresh: Date.now() }); // ← feed reload trigger
    } else {
      setError(data.error || data.detail || 'Upload failed');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          style={[styles.shareBtn, !image && styles.shareBtnDisabled]}
          onPress={handleUpload}
          disabled={loading || !image}
          activeOpacity={0.85}
        >
          {image ? (
            <LinearGradient
              colors={['#FF6B00', '#FF9A3C']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shareBtnGradient}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.shareBtnText}>Share</Text>
              }
            </LinearGradient>
          ) : (
            <Text style={[styles.shareBtnText, styles.shareBtnTextDisabled]}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIconBox}>
              <Text style={styles.placeholderIcon}>+</Text>
            </View>
            <Text style={styles.placeholderTitle}>Photo add karo</Text>
            <Text style={styles.placeholderSubtext}>Gallery se select karo</Text>
          </View>
        )}
      </TouchableOpacity>

      {image && (
        <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
          <Text style={styles.changeBtnText}>Photo badlo</Text>
        </TouchableOpacity>
      )}

      <View style={styles.captionSection}>
        <Text style={styles.captionLabel}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Kuch likho is post ke baare mein..."
          placeholderTextColor="#555"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={[styles.charCount, caption.length > 450 && styles.charCountWarn]}>
          {caption.length}/500
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.uploadBtn, (!image || loading) && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={loading || !image}
        activeOpacity={0.85}
      >
        {image || loading ? (
          <LinearGradient
            colors={['#FF6B00', '#FF9A3C']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.uploadBtnGradient}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.uploadBtnText}>Post Karo</Text>
            }
          </LinearGradient>
        ) : (
          <Text style={[styles.uploadBtnText, styles.uploadBtnTextDisabled]}>Post Karo</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const C = {
  bg: '#0F0F0F', surface: '#1C1C1E',
  border: '#2C2C2E', orange: '#FF6B00',
  white: '#FFFFFF', muted: '#ABABAB', dim: '#555555',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  headerTitle: { color: C.white, fontSize: 17, fontWeight: '700' },
  shareBtn: {
    borderRadius: 20, backgroundColor: C.orange, overflow: 'hidden',
    minWidth: 70, alignItems: 'center',
  },
  shareBtnGradient: { paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  shareBtnDisabled: {
    backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  shareBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
  shareBtnTextDisabled: { color: C.dim },
  imagePicker: {
    margin: 16, borderRadius: 20, overflow: 'hidden',
    backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
    aspectRatio: 1,
  },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  placeholderIconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: C.border,
  },
  placeholderIcon: { color: C.orange, fontSize: 34, fontWeight: '300' },
  placeholderTitle: { color: C.white, fontSize: 16, fontWeight: '600' },
  placeholderSubtext: { color: C.dim, fontSize: 13 },
  changeBtn: { marginHorizontal: 16, marginTop: -8, marginBottom: 8, alignItems: 'center' },
  changeBtnText: { color: C.orange, fontSize: 14, fontWeight: '600' },
  captionSection: { marginHorizontal: 16, marginTop: 8 },
  captionLabel: { color: C.muted, fontSize: 12, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  captionInput: {
    backgroundColor: C.surface, color: C.white,
    borderRadius: 14, padding: 14, fontSize: 15,
    borderWidth: 0.5, borderColor: C.border, minHeight: 100,
  },
  charCount: { color: C.dim, fontSize: 11, textAlign: 'right', marginTop: 4, marginRight: 4 },
  charCountWarn: { color: '#FF9A3C' },
  errorBox: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#2a1010', borderRadius: 12,
    padding: 12, borderWidth: 0.5, borderColor: '#5a1010',
  },
  errorText: { color: '#FF4444', fontSize: 13, textAlign: 'center' },
  uploadBtn: {
    margin: 16, backgroundColor: C.orange,
    borderRadius: 14, alignItems: 'center', overflow: 'hidden',
    shadowColor: C.orange, shadowOpacity: 0.28, shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  uploadBtnDisabled: {
    backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
    padding: 16, shadowOpacity: 0, elevation: 0,
  },
  uploadBtnGradient: { width: '100%', padding: 16, alignItems: 'center' },
  uploadBtnText: { color: C.white, fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  uploadBtnTextDisabled: { color: C.dim },
});