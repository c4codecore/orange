from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, posts, likes, comments, follows, users, ws

app = FastAPI(title="Orange API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(likes.router, prefix="/likes", tags=["Likes"])
app.include_router(comments.router, prefix="/comments", tags=["Comments"])
app.include_router(follows.router, prefix="/follows", tags=["Follows"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(ws.router, tags=["WebSocket"])

@app.get("/")
def root():
    return {"message": "Orange API Running 🍊"}