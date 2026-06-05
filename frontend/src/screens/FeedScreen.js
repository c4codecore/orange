
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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
    if (activeComment === postId) {
      setActiveComment(null);
      return;
    }
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{item.author}</Text>
      </View>

      {/* Image */}
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>{item.liked ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionCount}>{item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => loadComments(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{item.comments_count}</Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {item.caption ? (
        <Text style={styles.caption}><Text style={styles.username}>{item.author} </Text>{item.caption}</Text>
      ) : null}

      {/* Comments Section */}
      {activeComment === item.id && (
        <View style={styles.commentsSection}>
          {(comments[item.id] || []).map(c => (
            <Text key={c.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{c.author} </Text>{c.content}
            </Text>
          ))}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.commentBox}
              placeholder="Comment likho..."
              placeholderTextColor="#666"
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity onPress={() => handleComment(item.id)}>
              <Text style={styles.sendBtn}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator color="#FF6B00" size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍊 Orange</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFeed(); }} tintColor="#FF6B00" />}
        ListEmptyComponent={<Text style={styles.empty}>Koi post nahi hai abhi</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  header: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTitle: { color: '#FF6B00', fontSize: 24, fontWeight: 'bold' },
  post: { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FF6B00', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  username: { color: '#fff', fontWeight: 'bold' },
  image: { width: '100%', aspectRatio: 1 },
  actions: { flexDirection: 'row', padding: 12, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 22 },
  actionCount: { color: '#fff', fontSize: 14 },
  caption: { color: '#ccc', paddingHorizontal: 12, paddingBottom: 8 },
  commentsSection: { paddingHorizontal: 12, paddingBottom: 12 },
  comment: { color: '#ccc', marginBottom: 4 },
  commentAuthor: { color: '#fff', fontWeight: 'bold' },
  commentInput: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  commentBox: { flex: 1, backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  sendBtn: { color: '#FF6B00', fontWeight: 'bold' },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 16 },
});