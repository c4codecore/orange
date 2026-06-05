import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl, TextInput, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

function GradientBrandText() {
    if (Platform.OS === 'web') {
        return <Text style={[styles.headerTitle, styles.headerTitleWeb]}>Orange</Text>;
    }

    return (
        <MaskedView maskElement={<Text style={styles.headerTitle}>Orange</Text>}>
            <LinearGradient
                colors={['#FF6B00', '#FF9A3C']}
                start={{ x: 0, y: 0.2 }}
                end={{ x: 1, y: 0.8 }}
            >
                <Text style={[styles.headerTitle, styles.headerTitleHidden]}>Orange</Text>
            </LinearGradient>
        </MaskedView>
    );
}

export default function FeedScreen() {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [activeComment, setActiveComment] = useState(null);
    const [comments, setComments] = useState({});

    const loadFeed = async () => {
        const data = await api.getFeed(token);
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { loadFeed(); }, []);

    const handleLike = async (postId) => {
        const post = posts.find(p => p.id === postId);
        if (post.liked) {
            await api.unlikePost(token, postId);
            setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count - 1, liked: false } : p));
        } else {
            await api.likePost(token, postId);
            setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1, liked: true } : p));
        }
    };

    const loadComments = async (postId) => {
        if (activeComment === postId) { setActiveComment(null); return; }
        const data = await api.getComments(token, postId);
        if (Array.isArray(data)) setComments(prev => ({ ...prev, [postId]: data }));
        setActiveComment(postId);
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        const data = await api.addComment(token, postId, commentText);
        if (data.id) {
            setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
            setCommentText('');
        }
    };

    const renderPost = ({ item }) => (
        <View style={styles.post}>
            {/* Header */}
            <View style={styles.postHeader}>
                <LinearGradient
                    colors={['#FF6B00', '#FF9A3C', '#FFD0A1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
                    </View>
                </LinearGradient>
                <View>
                    <Text style={styles.username}>{item.author}</Text>
                    <Text style={styles.timeAgo}>just now</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Text style={styles.moreText}>•••</Text>
                </TouchableOpacity>
            </View>

            {/* Image */}
            <View style={styles.imageWrap}>
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
                <LinearGradient
                    colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.72)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.imageFade}
                />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <View style={styles.actionsLeft}>
                    <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionBtn}>
                        <Text style={[styles.actionIcon, item.liked && styles.liked]}>{item.liked ? <Ionicons name="heart" size={22} color="#f01515" /> : <Ionicons name="heart-outline" size={22} color="#ABABAB" />}</Text>
                        {/* <Ionicons name="heart-outline" size={22} color="#ABABAB" /> */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => loadComments(item.id)} style={styles.actionBtn}>
                        <Text style={styles.actionIcon}><Ionicons name="chatbubble-outline" size={22} color="#ABABAB" /></Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionIcon}><Ionicons name="paper-plane-outline" size={22} color="#ABABAB" /></Text>
                </TouchableOpacity>
            </View>

            {/* Likes count */}
            {item.likes_count > 0 && (
                <Text style={styles.likesCount}>{item.likes_count} likes</Text>
            )}

            {/* Caption */}
            {item.caption ? (
                <Text style={styles.caption}>
                    <Text style={styles.captionUsername}>{item.author} </Text>
                    {item.caption}
                </Text>
            ) : null}

            {/* View comments */}
            {item.comments_count > 0 && activeComment !== item.id && (
                <TouchableOpacity onPress={() => loadComments(item.id)}>
                    <Text style={styles.viewComments}>View all {item.comments_count} comments</Text>
                </TouchableOpacity>
            )}

            {/* Comments Section */}
            {activeComment === item.id && (
                <View style={styles.commentsSection}>
                    {(comments[item.id] || []).map(c => (
                        <View key={c.id} style={styles.commentRow}>
                            <Text style={styles.commentAuthor}>{c.author}</Text>
                            <Text style={styles.commentContent}> {c.content}</Text>
                        </View>
                    ))}
                    <View style={styles.commentInputRow}>
                        <View style={styles.commentAvatar}>
                            <Text style={styles.commentAvatarText}>N</Text>
                        </View>
                        <TextInput
                            style={styles.commentBox}
                            placeholder="Comment karo..."
                            placeholderTextColor="#555"
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity onPress={() => handleComment(item.id)}>
                            <Text style={styles.sendBtn}>Post</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Divider */}
            <View style={styles.postDivider} />
        </View>
    );

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator color="#FF6B00" size="large" />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <GradientBrandText />
                <View style={styles.headerIcons}>
                    {/* <TouchableOpacity style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>♥</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>✉</Text>
                    </TouchableOpacity> */}
                </View>
            </View>

            <FlatList
                data={posts}
                keyExtractor={item => item.id.toString()}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadFeed(); }}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🍊</Text>
                        <Text style={styles.emptyText}>Koi post nahi hai abhi</Text>
                        <Text style={styles.emptySubtext}>Follow karo logon ko ya pehli post karo!</Text>
                    </View>
                }
            />
        </View>
    );
}

const C = {
    bg: '#0F0F0F',
    surface: '#1C1C1E',
    border: '#2C2C2E',
    orange: '#FF6B00',
    white: '#FFFFFF',
    muted: '#ABABAB',
    dim: '#555555',
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
    header: {
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 0.5, borderBottomColor: C.border,
    },
    headerTitle: { color: C.orange, fontSize: 22, fontWeight: '700', letterSpacing: 1 },
    headerTitleWeb: {
        color: 'transparent',
        backgroundImage: 'linear-gradient(105deg, #FF6B00 0%, #FF9A3C 58%, #FFD0A1 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        textShadow: '0 0 18px rgba(255, 107, 0, 0.22)',
    },
    headerTitleHidden: { opacity: 0 },
    headerIcons: { flexDirection: 'row', gap: 8 },
    headerIcon: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    headerIconText: { fontSize: 14, color: C.white },
    post: { paddingTop: 4 },
    postHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 10, gap: 10,
    },
    avatarRing: {
        width: 42, height: 42, borderRadius: 21,
        padding: 2,
    },
    avatar: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: C.bg,
    },
    avatarText: { color: C.white, fontWeight: '700', fontSize: 15 },
    username: { color: C.white, fontWeight: '600', fontSize: 14 },
    timeAgo: { color: C.dim, fontSize: 11, marginTop: 1 },
    moreBtn: { marginLeft: 'auto' },
    moreText: { color: C.muted, fontSize: 16, letterSpacing: 2 },
    imageWrap: { width: '100%', aspectRatio: 1, overflow: 'hidden' },
    image: { width: '100%', height: '100%' },
    imageFade: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '36%',
        pointerEvents: 'none',
    },
    actions: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 10,
    },
    actionsLeft: { flexDirection: 'row', gap: 14 },
    actionBtn: { padding: 2 },
    actionIcon: { fontSize: 24 },
    liked: { transform: [{ scale: 1.1 }] },
    likesCount: { color: C.white, fontWeight: '600', fontSize: 13, paddingHorizontal: 16, marginBottom: 4 },
    caption: { color: C.muted, paddingHorizontal: 16, paddingBottom: 6, fontSize: 13, lineHeight: 18 },
    captionUsername: { color: C.white, fontWeight: '600' },
    viewComments: { color: C.dim, paddingHorizontal: 16, paddingBottom: 6, fontSize: 13 },
    commentsSection: { paddingHorizontal: 16, paddingBottom: 10 },
    commentRow: { flexDirection: 'row', marginBottom: 4 },
    commentAuthor: { color: C.white, fontWeight: '600', fontSize: 13 },
    commentContent: { color: C.muted, fontSize: 13, flex: 1 },
    commentInputRow: {
        flexDirection: 'row', alignItems: 'center',
        gap: 10, marginTop: 8,
    },
    commentAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: C.orange, justifyContent: 'center', alignItems: 'center',
    },
    commentAvatarText: { color: C.white, fontWeight: '700', fontSize: 11 },
    commentBox: {
        flex: 1, backgroundColor: C.surface, color: C.white,
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
        fontSize: 13, borderWidth: 0.5, borderColor: C.border,
    },
    sendBtn: { color: C.orange, fontWeight: '700', fontSize: 13 },
    postDivider: { height: 0.5, backgroundColor: C.border, marginTop: 4 },
    emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 8 },
    emptyIcon: { fontSize: 48, marginBottom: 8 },
    emptyText: { color: C.white, fontSize: 16, fontWeight: '600' },
    emptySubtext: { color: C.dim, fontSize: 13 },
});
