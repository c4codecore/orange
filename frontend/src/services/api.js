const BASE_URL = 'http://192.168.1.4:8001';

export const api = {
  // Auth
  register: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Posts
  getFeed: async (token) => {
    const res = await fetch(`${BASE_URL}/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  createPost: async (token, formData) => {
  const res = await fetch(`${BASE_URL}/posts/`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  return res.json();
},

  // Likes
  likePost: async (token, postId) => {
    const res = await fetch(`${BASE_URL}/likes/${postId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  unlikePost: async (token, postId) => {
    const res = await fetch(`${BASE_URL}/likes/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Comments
  getComments: async (token, postId) => {
    const res = await fetch(`${BASE_URL}/comments/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  addComment: async (token, postId, content) => {
    const res = await fetch(`${BASE_URL}/comments/${postId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  // Users
  getMyProfile: async (token) => {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getUserProfile: async (token, username) => {
    const res = await fetch(`${BASE_URL}/users/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  followUser: async (token, userId) => {
    const res = await fetch(`${BASE_URL}/follows/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  unfollowUser: async (token, userId) => {
    const res = await fetch(`${BASE_URL}/follows/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
