import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity, Share,
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
                colors={['#FF6B00', '#FF9A3C', '#FFD0A1']}
                start={{ x: 0, y: 0.2 }}
                end={{ x: 1, y: 0.8 }}
            >
                <Text style={[styles.headerTitle, styles.headerTitleHidden]}>Orange</Text>
            </LinearGradient>
        </MaskedView>
    );
}

const getInitial = (name = '') => name?.[0]?.toUpperCase() || 'O';
const getHandle = (name = '') => `@${name.replace(/\s+/g, '').toLowerCase() || 'orange'}`;

const formatTimeAgo = (value) => {
    if (!value) return 'just now';
    const dateStr = value.endsWith('Z') ? value : value + 'Z'; // UTC timezone fix
    const created = new Date(dateStr);
    if (Number.isNaN(created.getTime())) return 'just now';
    const seconds = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));
    if (seconds < 45) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function FeedScreen({ navigation, route }) {
    const { token, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [commentText, setCommentText] = useState({}); // fix: object instead of string
    const [activeComment, setActiveComment] = useState(null);
    const [comments, setComments] = useState({});
    const [activeMenu, setActiveMenu] = useState(null);
    const [notice, setNotice] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const showNotice = (message) => {
        setNotice(message);
        setTimeout(() => setNotice(''), 2200);
    };

    const loadFeed = async () => {
        const data = await api.getFeed(token);
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { loadFeed(); }, []);

    // Upload ke baad feed refresh
    useEffect(() => {
        if (route?.params?.refresh) {
            loadFeed();
        }
    }, [route?.params?.refresh]);

    useEffect(() => {
        if (!searchOpen || searchText.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            const data = await api.searchUsers(token, searchText.trim());
            if (Array.isArray(data)) setSearchResults(data);
        }, 280);
        return () => clearTimeout(timer);
    }, [searchOpen, searchText, token]);

    const goToUser = (username) => {
        setActiveMenu(null);
        setSearchOpen(false);
        setSearchText('');
        setSearchResults([]);
        if (!username) return;
        if (username === user?.username) {
            navigation.navigate('Profile');
        } else {
            navigation.navigate('UserProfile', { username });
        }
    };

    const handleLike = async (postId) => {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (post.liked) {
            await api.unlikePost(token, postId);
            setPosts(posts.map(p => p.id === postId
                ? { ...p, likes_count: Math.max(0, p.likes_count - 1), liked: false }
                : p));
        } else {
            await api.likePost(token, postId);
            setPosts(posts.map(p => p.id === postId
                ? { ...p, likes_count: p.likes_count + 1, liked: true }
                : p));
        }
    };

    const loadComments = async (postId) => {
        setActiveMenu(null);
        if (activeComment === postId) { setActiveComment(null); return; }
        const data = await api.getComments(token, postId);
        if (Array.isArray(data)) setComments(prev => ({ ...prev, [postId]: data }));
        setActiveComment(postId);
    };

    const handleComment = async (postId) => {
        const text = commentText[postId]?.trim();
        if (!text) return;
        const data = await api.addComment(token, postId, text);
        if (data.id) {
            setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
            setPosts(posts.map(p => p.id === postId
                ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                : p));
            setCommentText(prev => ({ ...prev, [postId]: '' })); // fix: sirf is post ka clear
        }
    };

    const handleShare = async (item) => {
        setActiveMenu(null);
        const message = `${item.author} on Orange${item.caption ? `: ${item.caption}` : ''}\n${item.image_url}`;
        if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(message);
            showNotice('Post link copied');
            return;
        }
        try {
            await Share.share({ message });
        } catch {
            showNotice('Share unavailable');
        }
    };

    const handleDelete = async (item) => {
        setActiveMenu(null);
        const data = await api.deletePost(token, item.id);
        if (data.message) {
            setPosts(posts.filter(p => p.id !== item.id));
            showNotice('Post deleted');
        } else {
            showNotice(data.error || data.detail || 'Delete failed');
        }
    };

    const toggleSearch = () => {
        setSearchOpen(prev => !prev);
        setActiveMenu(null);
    };

    const renderPost = ({ item }) => {
        const isMine = item.author_id === user?.id;

        return (
            <View style={styles.postShell}>
                <LinearGradient
                    colors={['rgba(255,154,60,0.34)', 'rgba(255,107,0,0.04)', 'rgba(255,255,255,0.06)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.postBorder}
                >
                    <View style={styles.post}>
                        <View style={styles.postHeader}>
                            <TouchableOpacity onPress={() => goToUser(item.author)} activeOpacity={0.78}>
                                <LinearGradient
                                    colors={['#FF6B00', '#FF9A3C', '#FFD0A1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.avatarRing}
                                >
                                    <View style={styles.avatar}>
                                        {item.author_avatar_url ? (
                                            <Image source={{ uri: item.author_avatar_url }} style={styles.avatarImage} />
                                        ) : (
                                            <Text style={styles.avatarText}>{getInitial(item.author)}</Text>
                                        )}
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.authorBlock} onPress={() => goToUser(item.author)} activeOpacity={0.78}>
                                <Text style={styles.username} numberOfLines={1}>{item.author}</Text>
                                <Text style={styles.handle} numberOfLines={1}>{getHandle(item.author)}</Text>
                            </TouchableOpacity>

                            <View style={styles.postMeta}>
                                <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
                                <TouchableOpacity
                                    style={[styles.moreBtn, activeMenu === item.id && styles.moreBtnActive]}
                                    onPress={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                    activeOpacity={0.75}
                                >
                                    <Ionicons name="ellipsis-horizontal" size={17} color={C.muted} />
                                </TouchableOpacity>
                            </View>

                            {activeMenu === item.id && (
                                <View style={styles.menu}>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => goToUser(item.author)}>
                                        <Ionicons name="person-outline" size={16} color={C.white} />
                                        <Text style={styles.menuText}>View profile</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.menuItem} onPress={() => handleShare(item)}>
                                        <Ionicons name="share-outline" size={16} color={C.white} />
                                        <Text style={styles.menuText}>Share post</Text>
                                    </TouchableOpacity>
                                    {isMine && (
                                        <TouchableOpacity style={styles.menuItem} onPress={() => handleDelete(item)}>
                                            <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                                            <Text style={styles.menuTextDanger}>Delete post</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.imageFrame} activeOpacity={0.94} onPress={() => setActiveMenu(null)}>
                            <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
                            <LinearGradient
                                colors={['rgba(15,15,15,0)', 'rgba(15,15,15,0.18)', 'rgba(15,15,15,0.78)']}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.imageFade}
                            />
                        </TouchableOpacity>

                        <View style={styles.postBody}>
                            <View style={styles.actions}>
                                <View style={styles.actionsLeft}>
                                    <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionPill} activeOpacity={0.76}>
                                        <Ionicons
                                            name={item.liked ? 'heart' : 'heart-outline'}
                                            size={20}
                                            color={item.liked ? '#FF4E4E' : C.white}
                                        />
                                        <Text style={styles.actionCount}>{item.likes_count || 0}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => loadComments(item.id)} style={styles.actionPill} activeOpacity={0.76}>
                                        <Ionicons name="chatbubble-outline" size={19} color={activeComment === item.id ? C.orangeSoft : C.white} />
                                        <Text style={styles.actionCount}>{item.comments_count || 0}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity style={styles.iconBtn} onPress={() => handleShare(item)} activeOpacity={0.76}>
                                    <Ionicons name="paper-plane-outline" size={20} color={C.white} />
                                </TouchableOpacity>
                            </View>

                            {item.caption ? (
                                <Text style={styles.caption}>
                                    <Text style={styles.captionUsername} onPress={() => goToUser(item.author)}>{item.author} </Text>
                                    {item.caption}
                                </Text>
                            ) : null}

                            {item.comments_count > 0 && activeComment !== item.id && (
                                <TouchableOpacity onPress={() => loadComments(item.id)} activeOpacity={0.75}>
                                    <Text style={styles.viewComments}>View all {item.comments_count} comments</Text>
                                </TouchableOpacity>
                            )}

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
                                            <Text style={styles.commentAvatarText}>{getInitial(user?.username)}</Text>
                                        </View>
                                        <TextInput
                                            style={styles.commentBox}
                                            placeholder="Comment karo..."
                                            placeholderTextColor="#555"
                                            value={commentText[item.id] || ''}
                                            onChangeText={(text) => setCommentText(prev => ({ ...prev, [item.id]: text }))}
                                        />
                                        <TouchableOpacity onPress={() => handleComment(item.id)} activeOpacity={0.75}>
                                            <Text style={styles.sendBtn}>Post</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    if (loading) return (
        <LinearGradient colors={['#17100C', C.bg, '#080808']} style={styles.center}>
            <ActivityIndicator color="#FF6B00" size="large" />
            <Text style={styles.loadingText}>Feed ready ho raha hai...</Text>
        </LinearGradient>
    );

    return (
        <LinearGradient colors={['#17100C', C.bg, '#080808']} style={styles.container}>
            <View style={styles.header}>
                <View>
                    <GradientBrandText />
                    <Text style={styles.headerSubtitle}>Premium moments</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={[styles.headerIcon, searchOpen && styles.headerIconActive]} onPress={toggleSearch} activeOpacity={0.78}>
                        <Ionicons name={searchOpen ? 'close-outline' : 'search-outline'} size={20} color={C.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIconPrimary} onPress={() => navigation.navigate('Upload')} activeOpacity={0.78}>
                        <LinearGradient
                            colors={['#FF6B00', '#FF9A3C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerIconGradient}
                        >
                            <Ionicons name="add" size={22} color={C.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {searchOpen && (
                <View style={styles.searchPanel}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search-outline" size={18} color={C.dim} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Users search karo..."
                            placeholderTextColor={C.dim}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                        />
                    </View>
                    {searchResults.map(result => (
                        <TouchableOpacity key={result.id} style={styles.searchResult} onPress={() => goToUser(result.username)}>
                            <LinearGradient
                                colors={['#FF6B00', '#FF9A3C']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.searchAvatar}
                            >
                                <Text style={styles.searchAvatarText}>{getInitial(result.username)}</Text>
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.searchName}>{result.username}</Text>
                                <Text style={styles.searchHandle}>{getHandle(result.username)}</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={18} color={C.dim} />
                        </TouchableOpacity>
                    ))}
                    {searchText.trim().length >= 2 && searchResults.length === 0 && (
                        <Text style={styles.searchEmpty}>No users found</Text>
                    )}
                </View>
            )}

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <FlatList
                data={posts}
                keyExtractor={item => item.id.toString()}
                renderItem={renderPost}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.feedList}
                onScrollBeginDrag={() => setActiveMenu(null)} // scroll pe menu close
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); loadFeed(); }}
                        tintColor="#FF6B00"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="images-outline" size={32} color={C.orange} />
                        </View>
                        <Text style={styles.emptyText}>Koi post nahi hai abhi</Text>
                        <Text style={styles.emptySubtext}>Follow karo logon ko ya pehli post karo!</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

const C = {
    bg: '#0F0F0F', surface: '#1C1C1E', elevated: '#242426',
    border: '#2C2C2E', orange: '#FF6B00', orangeSoft: '#FF9A3C',
    white: '#FFFFFF', muted: '#ABABAB', dim: '#555555',
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: C.muted, fontSize: 13, marginTop: 12 },
    header: {
        paddingTop: 50, paddingBottom: 14, paddingHorizontal: 18,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(15,15,15,0.88)',
    },
    headerTitle: { color: C.orange, fontSize: 25, fontWeight: '800', letterSpacing: 0.4 },
    headerTitleWeb: {
        color: 'transparent',
        backgroundImage: 'linear-gradient(105deg, #FF6B00 0%, #FF9A3C 58%, #FFD0A1 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        textShadow: '0 0 20px rgba(255, 107, 0, 0.24)',
    },
    headerTitleHidden: { opacity: 0 },
    headerSubtitle: { color: C.dim, fontSize: 11, marginTop: 1, fontWeight: '600' },
    headerIcons: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    headerIcon: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerIconActive: { borderColor: 'rgba(255,154,60,0.45)', backgroundColor: 'rgba(255,107,0,0.14)' },
    headerIconPrimary: {
        width: 38, height: 38, borderRadius: 19, overflow: 'hidden',
        shadowColor: C.orange, shadowOpacity: 0.26, shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 }, elevation: 4,
    },
    headerIconGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchPanel: {
        padding: 12, borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(15,15,15,0.96)',
    },
    searchBox: {
        maxWidth: 536, width: '100%', alignSelf: 'center',
        height: 42, borderRadius: 21, paddingHorizontal: 13,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: C.surface, borderWidth: 0.5, borderColor: C.border,
    },
    searchInput: { flex: 1, color: C.white, fontSize: 14 },
    searchResult: {
        maxWidth: 536, width: '100%', alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 10, paddingHorizontal: 4,
    },
    searchAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    searchAvatarText: { color: C.white, fontWeight: '800', fontSize: 13 },
    searchName: { color: C.white, fontWeight: '700', fontSize: 14 },
    searchHandle: { color: C.dim, fontSize: 12, marginTop: 1 },
    searchEmpty: { color: C.dim, fontSize: 13, textAlign: 'center', paddingTop: 12 },
    notice: {
        alignSelf: 'center', marginTop: 10, paddingHorizontal: 13, paddingVertical: 8,
        color: C.white, backgroundColor: 'rgba(255,107,0,0.22)',
        borderRadius: 16, overflow: 'hidden', fontSize: 12, fontWeight: '700',
    },
    feedList: { paddingTop: 14, paddingBottom: 92, width: '100%', maxWidth: 560, alignSelf: 'center' },
    postShell: { paddingHorizontal: 12, marginBottom: 16 },
    postBorder: {
        borderRadius: 24, padding: 1,
        shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 }, elevation: 5,
    },
    post: {
        borderRadius: 23, overflow: 'hidden',
        backgroundColor: C.surface, borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    postHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 12, gap: 10,
        backgroundColor: 'rgba(255,255,255,0.025)',
        position: 'relative', zIndex: 2,
    },
    avatarRing: { width: 44, height: 44, borderRadius: 22, padding: 2 },
    avatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: C.elevated, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: C.bg, overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { color: C.white, fontWeight: '800', fontSize: 15 },
    authorBlock: { flex: 1, minWidth: 0 },
    username: { color: C.white, fontWeight: '700', fontSize: 14.5 },
    handle: { color: C.dim, fontSize: 12, marginTop: 2 },
    postMeta: { alignItems: 'flex-end', gap: 6 },
    timeAgo: { color: C.dim, fontSize: 11 },
    moreBtn: { width: 28, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    moreBtnActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
    menu: {
        position: 'absolute', right: 12, top: 54, width: 166,
        borderRadius: 14, paddingVertical: 6, backgroundColor: '#232326',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000', shadowOpacity: 0.34, shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 }, elevation: 8, zIndex: 10,
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, paddingVertical: 10 },
    menuText: { color: C.white, fontSize: 13, fontWeight: '600' },
    menuTextDanger: { color: '#FF6B6B', fontSize: 13, fontWeight: '700' },
    imageFrame: {
        marginHorizontal: 10, borderRadius: 18, aspectRatio: 1,
        overflow: 'hidden', backgroundColor: '#080808',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)',
    },
    image: { width: '100%', height: '100%' },
    imageFade: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '38%', pointerEvents: 'none',
    },
    postBody: { paddingHorizontal: 12, paddingTop: 11, paddingBottom: 13 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    actionsLeft: { flexDirection: 'row', gap: 8 },
    actionPill: {
        minWidth: 58, height: 36, borderRadius: 18, paddingHorizontal: 11,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)',
    },
    iconBtn: {
        width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.09)',
    },
    actionCount: { color: C.white, fontSize: 13, fontWeight: '700' },
    caption: { color: C.muted, fontSize: 13.5, lineHeight: 19, marginBottom: 7 },
    captionUsername: { color: C.white, fontWeight: '700' },
    viewComments: { color: C.dim, paddingBottom: 4, fontSize: 13 },
    commentsSection: { marginTop: 6, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)' },
    commentRow: { flexDirection: 'row', marginBottom: 5 },
    commentAuthor: { color: C.white, fontWeight: '700', fontSize: 13 },
    commentContent: { color: C.muted, fontSize: 13, flex: 1 },
    commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 9 },
    commentAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: C.orange, justifyContent: 'center', alignItems: 'center',
    },
    commentAvatarText: { color: C.white, fontWeight: '800', fontSize: 11 },
    commentBox: {
        flex: 1, backgroundColor: '#141414', color: C.white,
        borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8,
        fontSize: 13, borderWidth: 0.5, borderColor: C.border,
    },
    sendBtn: { color: C.orangeSoft, fontWeight: '800', fontSize: 13 },
    emptyContainer: { alignItems: 'center', paddingTop: 88, gap: 9, paddingHorizontal: 24 },
    emptyIconBox: {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    emptyText: { color: C.white, fontSize: 16, fontWeight: '700' },
    emptySubtext: { color: C.dim, fontSize: 13, textAlign: 'center' },
});