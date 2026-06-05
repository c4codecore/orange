import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfileScreen() {
  const { token, user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    const data = await api.getMyProfile(token);
    if (data.id) setProfile(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#FF6B00" size="large" /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{profile?.username}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={profile?.posts || []}
        keyExtractor={item => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProfile(); }} tintColor="#FF6B00" />}
        ListHeaderComponent={
          <View>
            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile?.username?.[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{profile?.posts_count || 0}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{profile?.followers_count || 0}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{profile?.following_count || 0}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            {/* Bio */}
            <View style={styles.bioSection}>
              <Text style={styles.username}>{profile?.username}</Text>
              {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            </View>

            <Text style={styles.postsLabel}>Posts</Text>
          </View>
        }
        numColumns={3}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.image_url }}
            style={styles.gridImage}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Abhi koi post nahi</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: {
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { color: '#FF6B00', fontWeight: 'bold' },
  profileInfo: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FF6B00', justifyContent: 'center',
    alignItems: 'center', marginRight: 24
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12 },
  bioSection: { paddingHorizontal: 16, paddingBottom: 16 },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  bio: { color: '#ccc', marginTop: 4 },
  postsLabel: { color: '#888', fontSize: 12, textAlign: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1a1a1a' },
  gridImage: { width: '33.33%', aspectRatio: 1, padding: 1 },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
