```markdown
# 🍊 Orange — Social Media App

A full-stack Instagram-lite social media application where users can share photos, like, comment, and follow each other.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile + Web Frontend | React Native (Expo) — scaffolded (basic screens + navigation) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Migrations | Alembic |
| Authentication | JWT |
| Media Storage | Supabase Storage |
| ORM | SQLAlchemy |

---

## ✨ Features

- 📸 Photo upload & sharing
- ❤️ Like / Unlike posts
- 💬 Comment on posts
- 👥 Follow / Unfollow users
- 🔍 Search users
- 👤 User profiles
- 🔐 JWT Authentication

---

## 📁 Project Structure

orange-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── core/     # Config & Security
│   │   ├── models/   # Database models
│   │   ├── routers/  # API endpoints
│   │   └── schemas/  # Pydantic schemas
│   ├── alembic/      # DB migrations
│   └── .env          # Environment variables (not committed)
└── frontend/         # React Native Expo (scaffolded — basic screens + navigation)
	├── App.js
	├── package.json
	├── src/
	│   ├── navigation/
	│   │   └── AppNavigator.js
	│   ├── context/
	│   │   └── AuthContext.js
	│   ├── screens/
	│   │   ├── FeedScreen.js
	│   │   ├── LoginScreen.js
	│   │   ├── RegisterScreen.js
	│   │   ├── ProfileScreen.js
	│   │   └── UploadScreen.js
	│   └── services/
	│       └── api.js
```

---

## ⚙️ Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL
- Supabase account

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/orange-app.git
cd orange-app/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/orange_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_BUCKET=posts
```

### Database Setup

```bash
# Create PostgreSQL database
createdb orange_db

# Run migrations
alembic upgrade head
```

### Run Server

```bash
uvicorn app.main:app --reload --port 8001
```

**Swagger UI:** `http://localhost:8001/docs`

---

## 🖥️ Frontend (Development)

### Prerequisites
- Node.js (16+) and npm
- (optional) Expo CLI: `npm install -g expo-cli`

### Install & Run

```bash
cd frontend
npm install
npm start
```

To open on a device/emulator run `expo start` and follow the QR / emulator options.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login → JWT token |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts/` | Create post (image upload) |
| GET | `/posts/feed` | Get all posts feed |
| GET | `/posts/my` | Get my posts |
| DELETE | `/posts/{id}` | Delete post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/likes/{post_id}` | Like a post |
| DELETE | `/likes/{post_id}` | Unlike a post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/comments/{post_id}` | Add comment |
| GET | `/comments/{post_id}` | Get comments |
| DELETE | `/comments/{id}` | Delete comment |

### Follows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/follows/{user_id}` | Follow user |
| DELETE | `/follows/{user_id}` | Unfollow user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | My profile |
| PUT | `/users/me` | Update profile |
| GET | `/users/search?q=` | Search users |
| GET | `/users/{username}` | User profile |

---

## 🗺️ Roadmap

- [x] Backend API — FastAPI
- [x] Authentication — JWT
- [x] Photo upload — Supabase Storage
- [x] Likes, Comments, Follows
- [x] User profiles & search
- [ ] React Native (Expo) frontend — scaffolded (basic screens + navigation)
- [ ] Cross-platform — Mobile + Web
- [ ] Feed from followed users only
- [ ] Push notifications
- [ ] Production deployment

---

## 👨‍💻 Developer

**Neeraj Sharma**
Founder, Code Core Computer Center | Software Developer
Gurugram, India

---

"projectId": "47bc7765-7c90-4b6f-a65a-31b71c8707b6"