const BASE_URL = 'http://192.168.1.100:8001';

let _logoutCallback = null;
export const setLogoutCallback = (fn) => { _logoutCallback = fn; };

const apiFetch = async (url, options = {}) => {
  try {
    console.log(`[API] → ${options.method || 'GET'} ${url}`);
    const res = await fetch(url, options);
    console.log(`[API] ← ${res.status} ${url}`);

    if (res.status === 401) {
      console.log('[API] 401 — logout trigger');
      if (_logoutCallback) _logoutCallback();
      return { error: 'Session expire ho gayi, dobara login karo' };
    }

    const data = await res.json();
    console.log(`[API] Data:`, JSON.stringify(data).slice(0, 300));
    return data;
  } catch (e) {
    console.log(`[API] ERROR ${url}:`, e.message);
    return { error: 'Network error — server se connect nahi ho pa raha' };
  }
};

export const api = {

  register: (data) => {
    console.log('[AUTH] Register:', data.username, data.email);
    return apiFetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  login: (data) => {
    console.log('[AUTH] Login attempt:', data.email);
    return apiFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  getFeed: (token) => {
    console.log('[FEED] Loading feed...');
    return apiFetch(`${BASE_URL}/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  createPost: (token, formData) => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/posts/`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () => {
        console.log('[POST] XHR status:', xhr.status);
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('[POST] XHR response:', JSON.stringify(data).slice(0, 300));
          if (xhr.status === 401) {
            if (_logoutCallback) _logoutCallback();
            resolve({ error: 'Session expire ho gayi, dobara login karo' });
          } else {
            resolve(data);
          }
        } catch (e) {
          console.log('[POST] XHR parse error:', e.message);
          resolve({ error: 'Response parse failed' });
        }
      };

      xhr.onerror = () => {
        console.log('[POST] XHR error:', xhr.status);
        resolve({ error: 'Network error — server se connect nahi ho pa raha' });
      };

      xhr.send(formData);
    });
  },

  deletePost: (token, postId) => {
    console.log('[POST] Deleting post:', postId);
    return apiFetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMyPosts: (token) => {
    console.log('[POST] Loading my posts...');
    return apiFetch(`${BASE_URL}/posts/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  likePost: (token, postId) => {
    console.log('[LIKE] Liking post:', postId);
    return apiFetch(`${BASE_URL}/likes/${postId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  unlikePost: (token, postId) => {
    console.log('[LIKE] Unliking post:', postId);
    return apiFetch(`${BASE_URL}/likes/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getComments: (token, postId) => {
    console.log('[COMMENT] Loading comments for post:', postId);
    return apiFetch(`${BASE_URL}/comments/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  addComment: (token, postId, content) => {
    console.log('[COMMENT] Adding comment on post:', postId, '| content:', content);
    return apiFetch(`${BASE_URL}/comments/${postId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  },

  deleteComment: (token, commentId) => {
    console.log('[COMMENT] Deleting comment:', commentId);
    return apiFetch(`${BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getMyProfile: (token) => {
    console.log('[USER] Loading my profile...');
    return apiFetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateProfile: (token, data) => {
    console.log('[USER] Updating profile:', JSON.stringify(data));
    return apiFetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  getUserProfile: (token, username) => {
    console.log('[USER] Loading profile:', username);
    return apiFetch(`${BASE_URL}/users/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  searchUsers: (token, q) => {
    console.log('[USER] Searching:', q);
    return apiFetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  followUser: (token, userId) => {
    console.log('[FOLLOW] Following user:', userId);
    return apiFetch(`${BASE_URL}/follows/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  unfollowUser: (token, userId) => {
    console.log('[FOLLOW] Unfollowing user:', userId);
    return apiFetch(`${BASE_URL}/follows/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};