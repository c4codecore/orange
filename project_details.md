# 🍊 Orange App — Project Details

## Overview
**Orange** ek Instagram-lite style Social Media App hai jisme users photos upload kar sakte hain, like/comment/follow kar sakte hain.

| Field | Detail |
|-------|--------|
| Project Name | Orange |
| Type | Social Media Mobile App |
| Started | 4 June 2026 |
| Developer | Neeraj Sharma |
| Location | `C:\nnn\orange-app\` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (Expo) — scaffolded (basic screens + navigation) |
| Backend | FastAPI (Python) ✅ Complete |
| Database | PostgreSQL |
| Migrations | Alembic |
| Authentication | JWT (python-jose + bcrypt) |
| Media Storage | Supabase Storage |
| HTTP Client | httpx |
| ORM | SQLAlchemy |
| Config | pydantic-settings |

---

## Project Structure

```
orange-app/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── database.py           # DB connection + session
│   │   ├── dependencies.py       # get_current_user dependency
│   │   ├── core/
│   │   │   ├── config.py         # Settings via .env
│   │   │   └── security.py       # bcrypt + JWT
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── like.py
│   │   │   ├── comment.py
│   │   │   └── follow.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   └── comment.py
│   │   └── routers/
│   │       ├── auth.py           # ✅ Done
│   │       ├── posts.py          # ✅ Done
│   │       ├── likes.py          # ✅ Done
│   │       ├── comments.py       # ✅ Done
│   │       ├── follows.py        # ✅ Done
│   │       └── users.py          # ✅ Done
│   ├── alembic/                  # Migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
└── frontend/
  ├── App.js
  ├── package.json
  ├── app.json
  ├── src/
  │   ├── navigation/
  │   │   └── AppNavigator.js   # Navigation stack
  │   ├── context/
  │   │   └── AuthContext.js    # Auth state + token handling
  │   ├── screens/
  │   │   ├── FeedScreen.js
  │   │   ├── LoginScreen.js
  │   │   ├── RegisterScreen.js
  │   │   ├── ProfileScreen.js
  │   │   └── UploadScreen.js
  │   └── services/
  │       └── api.js            # API client for backend
  └── assets/
```

---

## Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://postgres:123@localhost:5432/orange_db
SECRET_KEY=orange-secret-key-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon public key>
SUPABASE_BUCKET=posts
```

---

## Database Models

### User
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| username | String(50) | Unique |
| email | String(100) | Unique |
| password_hash | String | bcrypt hashed |
| bio | Text | Nullable |
| avatar_url | String | Nullable |
| created_at | DateTime | Auto |

### Post
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| image_url | String | Supabase URL |
| caption | Text | Nullable |
| user_id | FK → users | |
| created_at | DateTime | Auto |

### Like
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| user_id | FK → users | |
| post_id | FK → posts | |
| created_at | DateTime | UniqueConstraint |

### Comment
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| content | Text | |
| user_id | FK → users | |
| post_id | FK → posts | |
| created_at | DateTime | Auto |

### Follow
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | PK |
| follower_id | FK → users | |
| following_id | FK → users | |
| created_at | DateTime | UniqueConstraint |

---

## APIs — All Completed ✅

### Auth (`/auth`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/auth/register` | New user signup | ✅ |
| POST | `/auth/login` | Login → JWT token | ✅ |

### Posts (`/posts`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/posts/` | Photo upload + create post | ✅ |
| GET | `/posts/feed` | All posts feed | ✅ |
| GET | `/posts/my` | My posts | ✅ |
| DELETE | `/posts/{id}` | Delete my post | ✅ |

### Likes (`/likes`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/likes/{post_id}` | Like a post | ✅ |
| DELETE | `/likes/{post_id}` | Unlike a post | ✅ |

### Comments (`/comments`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/comments/{post_id}` | Add comment | ✅ |
| GET | `/comments/{post_id}` | Get comments | ✅ |
| DELETE | `/comments/{comment_id}` | Delete comment | ✅ |

### Follows (`/follows`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/follows/{user_id}` | Follow user | ✅ |
| DELETE | `/follows/{user_id}` | Unfollow user | ✅ |

### Users (`/users`)
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/users/me` | My profile | ✅ |
| PUT | `/users/me` | Update profile | ✅ |
| GET | `/users/search?q=` | Search users | ✅ |
| GET | `/users/{username}` | User profile | ✅ |

---

## Supabase Setup

- **Project Region:** South Asia (Singapore)
- **Storage Bucket:** `posts` (Public)
- **RLS Policies Added:**
  - `allow all uploads` — INSERT for anon + authenticated
  - `allow all reads` — SELECT for anon + authenticated

---

## How to Run

```powershell
cd C:\nnn\orange-app\backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

**Swagger UI:** `http://localhost:8001/docs`

### Frontend (development)

```powershell
cd C:\nnn\orange-app\frontend
npm install
npm start
```

If using Expo CLI directly: `expo start` (ensure `expo-cli` installed globally)

---

## Issues Faced & Fixes

| Issue | Fix |
|-------|-----|
| PowerShell vs CMD confusion | Used `powershell` command to switch |
| `pydantic_settings` not installed | `pip install pydantic-settings` |
| `email-validator` missing | `pip install "pydantic[email]"` |
| `passlib` incompatible with Python 3.14 | Replaced with direct `bcrypt` library |
| `supabase` SDK build failed (pyiceberg error) | Used `httpx` for direct REST API calls |
| Supabase RLS policy blocking uploads | Added INSERT + SELECT policies via SQL Editor |
| Port 8000 occupied by CodeCore IMS | Ran Orange on `--port 8001` |

---

## Postman / cURL Commands

> Swagger me token authorize karne me dikkat thi, isliye Postman use kiya.

### Register
```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "neeraj", "email": "neeraj@test.com", "password": "123456"}'
```

### Login (Token lena)
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "neeraj@test.com", "password": "123456"}'
```

### Post Create (Image Upload)
```bash
curl -X POST http://localhost:8001/posts/ \
  -H "Authorization: Bearer <token>" \
  -F "caption=hello World" \
  -F "image=@/path/to/image.jpg;type=image/jpeg"
```

### Feed
```bash
curl -X GET http://localhost:8001/posts/feed \
  -H "Authorization: Bearer <token>"
```

### Like Post
```bash
curl -X POST http://localhost:8001/likes/1 \
  -H "Authorization: Bearer <token>"
```

### Add Comment
```bash
curl -X POST http://localhost:8001/comments/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Nice photo! 🍊"}'
```

### Follow User
```bash
curl -X POST http://localhost:8001/follows/2 \
  -H "Authorization: Bearer <token>"
```

### My Profile
```bash
curl -X GET http://localhost:8001/users/me \
  -H "Authorization: Bearer <token>"
```

### Search Users
```bash
curl -X GET "http://localhost:8001/users/search?q=neeraj" \
  -H "Authorization: Bearer <token>"
```

---

## Postman Setup

1. **Login request** chalao → `access_token` copy karo
2. Har protected request me **Headers** tab me add karo:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGci...token...`
3. Image upload ke liye **Body** → **form-data**:
   - `caption` → Text
   - `image` → File

---

## Next Steps
- [ ] Push notifications
- [ ] Production deployment