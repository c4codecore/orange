const BASE_URL = 'http://192.168.1.4:8001';

let _logoutCallback = null;
export const setLogoutCallback = (fn) => { _logoutCallback = fn; };

const apiFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      if (_logoutCallback) _logoutCallback();
      return { error: 'Session expire ho gayi, dobara login karo' };
    }
    const data = await res.json();
    return data;
  } catch (e) {
    return { error: 'Network error — server se connect nahi ho pa raha' };
  }
};

export const api = {
  register: (data) => apiFetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  login: (data) => apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getFeed: (token) => apiFetch(`${BASE_URL}/posts/feed`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  createPost: (token, formData) => apiFetch(`${BASE_URL}/posts/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: formData,
  }),

  deletePost: (token, postId) => apiFetch(`${BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),

  getMyPosts: (token) => apiFetch(`${BASE_URL}/posts/my`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  likePost: (token, postId) => apiFetch(`${BASE_URL}/likes/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }),

  unlikePost: (token, postId) => apiFetch(`${BASE_URL}/likes/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),

  getComments: (token, postId) => apiFetch(`${BASE_URL}/comments/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  addComment: (token, postId, content) => apiFetch(`${BASE_URL}/comments/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  }),

  deleteComment: (token, commentId) => apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),

  getMyProfile: (token) => apiFetch(`${BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  updateProfile: (token, data) => apiFetch(`${BASE_URL}/users/me`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getUserProfile: (token, username) => apiFetch(`${BASE_URL}/users/${username}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  searchUsers: (token, q) => apiFetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  followUser: (token, userId) => apiFetch(`${BASE_URL}/follows/${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }),

  unfollowUser: (token, userId) => apiFetch(`${BASE_URL}/follows/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),
};