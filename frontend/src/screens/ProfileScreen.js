import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const { token, logout } = useAuth();
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

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator color="#FF6B00" size="large" />
        </View>
    );

    return (
        <FlatList
            style={styles.container}
            data={profile?.posts || []}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadProfile(); }}
                    tintColor="#FF6B00"
                />
            }
            ListHeaderComponent={
                <View>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{profile?.username}</Text>
                        <TouchableOpacity style={styles.menuBtn} onPress={logout}>
                            <Text style={styles.menuIcon}>☰</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Profile Info */}
                    <View style={styles.profileSection}>
                        <LinearGradient
                            colors={['#FF6B00', '#FF9A3C', '#FFD0A1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatarContainer}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {profile?.username?.[0]?.toUpperCase()}
                                </Text>
                            </View>
                        </LinearGradient>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>{profile?.posts_count || 0}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>{profile?.followers_count || 0}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>{profile?.following_count || 0}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>
                    </View>

                    {/* Bio */}
                    <View style={styles.bioSection}>
                        <Text style={styles.fullName}>{profile?.username}</Text>
                        {profile?.bio
                            ? <Text style={styles.bio}>{profile.bio}</Text>
                            : <Text style={styles.bioEmpty}>Bio add karo...</Text>
                        }
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.editBtn}>
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareProfileBtn}>
                            <Text style={styles.shareProfileBtnText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuBtn} onPress={logout}>
                            <Ionicons name="menu-outline" size={20} color="#ABABAB" />
                        </TouchableOpacity>
                    </View>

                    {/* Grid Divider */}
                    <View style={styles.gridHeader}>
                        <View style={styles.gridTabActive}>
                            <Text style={styles.gridTabIcon}>⊞</Text>
                        </View>
                    </View>
                </View>
            }
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
                    <Image source={{ uri: item.image_url }} style={styles.gridImage} resizeMode="cover" />
                </TouchableOpacity>
            )}
            ListEmptyComponent={
                <View style={styles.emptyGrid}>
                    <View style={styles.emptyIconBox}>
                        <Text style={styles.emptyIcon}>📷</Text>
                    </View>
                    <Text style={styles.emptyTitle}>Koi post nahi hai</Text>
                    <Text style={styles.emptySubtext}>Pehli photo share karo!</Text>
                </View>
            }
        />
    );
}

const C = {
    bg: '#0F0F0F', surface: '#1C1C1E',
    border: '#2C2C2E', orange: '#FF6B00',
    white: '#FFFFFF', muted: '#ABABAB', dim: '#555555',
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
    header: {
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 0.5, borderBottomColor: C.border,
    },
    headerTitle: { color: C.white, fontSize: 17, fontWeight: '700' },
    menuBtn: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    menuIcon: { color: C.muted, fontSize: 14 },
    profileSection: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 20, gap: 20,
    },
    avatarContainer: {
        padding: 2, borderRadius: 50,
        shadowColor: C.orange, shadowOpacity: 0.22, shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 }, elevation: 4,
    },
    avatar: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: C.bg,
    },
    avatarText: { color: C.white, fontSize: 30, fontWeight: '700' },
    statsRow: {
        flex: 1, flexDirection: 'row',
        justifyContent: 'space-around', alignItems: 'center',
    },
    stat: { alignItems: 'center', gap: 2 },
    statNum: { color: C.white, fontSize: 18, fontWeight: '700' },
    statLabel: { color: C.muted, fontSize: 12 },
    statDivider: { width: 0.5, height: 28, backgroundColor: C.border },
    bioSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 3 },
    fullName: { color: C.white, fontSize: 14, fontWeight: '600' },
    bio: { color: C.muted, fontSize: 13, lineHeight: 18 },
    bioEmpty: { color: C.dim, fontSize: 13, fontStyle: 'italic' },
    actionButtons: {
        flexDirection: 'row', paddingHorizontal: 16,
        paddingBottom: 16, gap: 8,
    },
    editBtn: {
        flex: 1, backgroundColor: C.surface, borderRadius: 10,
        padding: 10, alignItems: 'center',
        borderWidth: 0.5, borderColor: C.border,
    },
    editBtnText: { color: C.white, fontWeight: '600', fontSize: 13 },
    shareProfileBtn: {
        flex: 1, backgroundColor: C.surface, borderRadius: 10,
        padding: 10, alignItems: 'center',
        borderWidth: 0.5, borderColor: C.border,
    },
    shareProfileBtnText: { color: C.white, fontWeight: '600', fontSize: 13 },
    logoutBtn: {
        width: 38, backgroundColor: C.surface, borderRadius: 10,
        padding: 10, alignItems: 'center',
        borderWidth: 0.5, borderColor: C.border,
    },
    logoutBtnText: { color: C.muted, fontSize: 14 },
    gridHeader: {
        flexDirection: 'row', borderTopWidth: 0.5,
        borderTopColor: C.border, justifyContent: 'center',
    },
    gridTabActive: {
        paddingVertical: 10, paddingHorizontal: 20,
        borderTopWidth: 1.5, borderTopColor: C.orange,
    },
    gridTabIcon: { color: C.orange, fontSize: 18 },
    gridItem: { width: '33.33%', aspectRatio: 1, padding: 0.75 },
    gridImage: { width: '100%', height: '100%' },
    emptyGrid: { alignItems: 'center', paddingTop: 50, paddingBottom: 30, gap: 10 },
    emptyIconBox: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: C.surface, justifyContent: 'center',
        alignItems: 'center', marginBottom: 4,
    },
    emptyIcon: { fontSize: 32 },
    emptyTitle: { color: C.white, fontSize: 16, fontWeight: '600' },
    emptySubtext: { color: C.dim, fontSize: 13 },
});
