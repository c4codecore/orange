import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity, Share,
    StyleSheet, ActivityIndicator, RefreshControl, TextInput, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { wsService } from '../services/websocket';

const getInitial = (name = '') => name?.[0]?.toUpperCase() || 'O';

export default function ProfileScreen({ route, navigation }) {
    const { token, user, logout } = useAuth();
    const usernameParam = route?.params?.username;
    const isOwnProfile = !usernameParam || usernameParam === user?.username;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [bioText, setBioText] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => { loadProfile(); }, [usernameParam]);

    const showNotice = (message) => {
        setNotice(message);
        setTimeout(() => setNotice(''), 2200);
    };

    const loadProfile = async () => {
        if (isOwnProfile) {
            const data = await api.getMyProfile(token);
            const posts = await api.getMyPosts(token);
            if (data.id) {
                const nextProfile = { ...data, posts: Array.isArray(posts) ? posts : [] };
                setProfile(nextProfile);
                setBioText(nextProfile.bio || '');
            }
        } else {
            const data = await api.getUserProfile(token, usernameParam);
            if (data.id) {
                setProfile(data);
                setBioText(data.bio || '');
            }
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        if (!profile?.id) return;

        const unsubscribers = [
            wsService.on('follow_added', ({ follower_id, following_id }) => {
                setProfile(prev => {
                    if (!prev) return prev;
                    let updated = { ...prev };
                    if (following_id === prev.id) {
                        updated.followers_count = (prev.followers_count || 0) + 1;
                    }
                    if (follower_id === prev.id && isOwnProfile) {
                        updated.following_count = (prev.following_count || 0) + 1;
                    }
                    if (following_id === prev.id && follower_id === user?.id) {
                        updated.is_following = true;
                    }
                    return updated;
                });
            }),

            wsService.on('follow_removed', ({ follower_id, following_id }) => {
                setProfile(prev => {
                    if (!prev) return prev;
                    let updated = { ...prev };
                    if (following_id === prev.id) {
                        updated.followers_count = Math.max(0, (prev.followers_count || 0) - 1);
                    }
                    if (follower_id === prev.id && isOwnProfile) {
                        updated.following_count = Math.max(0, (prev.following_count || 0) - 1);
                    }
                    if (following_id === prev.id && follower_id === user?.id) {
                        updated.is_following = false;
                    }
                    return updated;
                });
            }),
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, [profile?.id, user?.id]);

    const handleFollow = async () => {
        if (!profile?.id) return;
        const data = profile.is_following
            ? await api.unfollowUser(token, profile.id)
            : await api.followUser(token, profile.id);

        if (data.message) {
            setProfile(prev => ({
                ...prev,
                is_following: !prev.is_following,
                followers_count: prev.is_following
                    ? Math.max(0, (prev.followers_count || 0) - 1)
                    : (prev.followers_count || 0) + 1,
            }));
        }
    };

    const handleSaveBio = async () => {
        const data = await api.updateProfile(token, { bio: bioText });
        if (data.message) {
            setProfile(prev => ({ ...prev, bio: bioText }));
            setEditing(false);
            showNotice('Profile updated');
        } else {
            showNotice(data.detail || 'Update failed');
        }
    };

    const handleShareProfile = async () => {
        const message = `Check out ${profile?.username} on Orange`;

        if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(message);
            showNotice('Profile copied');
            return;
        }

        try {
            await Share.share({ message });
        } catch {
            showNotice('Share unavailable');
        }
    };

    if (loading) return (
        <LinearGradient colors={['#17100C', C.bg, '#080808']} style={styles.center}>
            <ActivityIndicator color="#FF6B00" size="large" />
        </LinearGradient>
    );

    return (
        <LinearGradient colors={['#17100C', C.bg, '#080808']} style={styles.container}>
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <FlatList
                data={profile?.posts || []}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadProfile(); }}
                        tintColor="#FF6B00"
                    />
                }
                ListHeaderComponent={
                    <View>
                        <View style={styles.header}>
                            {isOwnProfile ? (
                                <Text style={styles.headerTitle}>{profile?.username}</Text>
                            ) : (
                                <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
                                    <Ionicons name="chevron-back" size={22} color={C.white} />
                                    <Text style={styles.headerTitle}>{profile?.username}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.menuBtn} onPress={isOwnProfile ? logout : handleShareProfile}>
                                <Ionicons name={isOwnProfile ? 'log-out-outline' : 'share-outline'} size={20} color={C.muted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileCardBorder}>
                            <View style={styles.profileCard}>
                                <View style={styles.profileSection}>
                                    <LinearGradient
                                        colors={['#FF6B00', '#FF9A3C', '#FFD0A1']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.avatarContainer}
                                    >
                                        <View style={styles.avatar}>
                                            {profile?.avatar_url ? (
                                                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarText}>{getInitial(profile?.username)}</Text>
                                            )}
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

                                <View style={styles.bioSection}>
                                    <Text style={styles.fullName}>{profile?.username}</Text>
                                    {editing ? (
                                        <TextInput
                                            style={styles.bioInput}
                                            value={bioText}
                                            onChangeText={setBioText}
                                            placeholder="Bio add karo..."
                                            placeholderTextColor={C.dim}
                                            multiline
                                        />
                                    ) : profile?.bio ? (
                                        <Text style={styles.bio}>{profile.bio}</Text>
                                    ) : (
                                        <Text style={styles.bioEmpty}>Bio add karo...</Text>
                                    )}
                                </View>

                                <View style={styles.actionButtons}>
                                    {isOwnProfile ? (
                                        <TouchableOpacity style={styles.primaryBtn} onPress={editing ? handleSaveBio : () => setEditing(true)}>
                                            <Text style={styles.primaryBtnText}>{editing ? 'Save Bio' : 'Edit Profile'}</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={styles.primaryBtn} onPress={handleFollow}>
                                            <Text style={styles.primaryBtnText}>{profile?.is_following ? 'Following' : 'Follow'}</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.secondaryBtn} onPress={handleShareProfile}>
                                        <Text style={styles.secondaryBtnText}>Share</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.gridHeader}>
                            <Ionicons name="grid-outline" size={18} color={C.orange} />
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.gridItem} activeOpacity={0.84}>
                        <Image source={{ uri: item.image_url }} style={styles.gridImage} resizeMode="cover" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyGrid}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="camera-outline" size={32} color={C.orange} />
                        </View>
                        <Text style={styles.emptyTitle}>Koi post nahi hai</Text>
                        <Text style={styles.emptySubtext}>{isOwnProfile ? 'Pehli photo share karo!' : 'Is user ne abhi post nahi kiya.'}</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

const C = {
    bg: '#0F0F0F', surface: '#1C1C1E',
    border: '#2C2C2E', orange: '#FF6B00',
    orangeSoft: '#FF9A3C', white: '#FFFFFF',
    muted: '#ABABAB', dim: '#555555',
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 90 },
    notice: {
        position: 'absolute', top: 96, zIndex: 20, alignSelf: 'center',
        paddingHorizontal: 13, paddingVertical: 8, borderRadius: 16,
        overflow: 'hidden', backgroundColor: 'rgba(255,107,0,0.22)',
        color: C.white, fontSize: 12, fontWeight: '700',
    },
    header: {
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(15,15,15,0.88)',
    },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerTitle: { color: C.white, fontSize: 17, fontWeight: '800' },
    menuBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    profileCardBorder: {
        margin: 14,
        borderRadius: 24,
        padding: 1,
        backgroundColor: 'rgba(255,154,60,0.28)',
    },
    profileCard: {
        borderRadius: 23,
        backgroundColor: C.surface,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.07)',
        overflow: 'hidden',
    },
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
        borderWidth: 2, borderColor: C.bg, overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { color: C.white, fontSize: 30, fontWeight: '800' },
    statsRow: {
        flex: 1, flexDirection: 'row',
        justifyContent: 'space-around', alignItems: 'center',
    },
    stat: { alignItems: 'center', gap: 2 },
    statNum: { color: C.white, fontSize: 18, fontWeight: '800' },
    statLabel: { color: C.muted, fontSize: 12 },
    statDivider: { width: 0.5, height: 28, backgroundColor: C.border },
    bioSection: { paddingHorizontal: 16, paddingBottom: 16, gap: 4 },
    fullName: { color: C.white, fontSize: 14, fontWeight: '700' },
    bio: { color: C.muted, fontSize: 13, lineHeight: 18 },
    bioEmpty: { color: C.dim, fontSize: 13, fontStyle: 'italic' },
    bioInput: {
        minHeight: 72,
        color: C.white,
        backgroundColor: '#141414',
        borderWidth: 0.5,
        borderColor: C.border,
        borderRadius: 14,
        padding: 12,
        fontSize: 13,
        textAlignVertical: 'top',
    },
    actionButtons: {
        flexDirection: 'row', paddingHorizontal: 16,
        paddingBottom: 16, gap: 8,
    },
    primaryBtn: {
        flex: 1, backgroundColor: C.orange, borderRadius: 12,
        padding: 11, alignItems: 'center',
    },
    primaryBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
    secondaryBtn: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12,
        padding: 11, alignItems: 'center',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
    gridHeader: {
        flexDirection: 'row', borderTopWidth: 0.5,
        borderTopColor: C.border, justifyContent: 'center',
        paddingVertical: 11,
    },
    gridItem: { width: '33.33%', aspectRatio: 1, padding: 1 },
    gridImage: { width: '100%', height: '100%', borderRadius: 4 },
    emptyGrid: { alignItems: 'center', paddingTop: 50, paddingBottom: 30, gap: 10 },
    emptyIconBox: {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 4,
    },
    emptyTitle: { color: C.white, fontSize: 16, fontWeight: '700' },
    emptySubtext: { color: C.dim, fontSize: 13, textAlign: 'center' },
});
