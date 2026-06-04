from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.follow import Follow
from app.models.post import Post
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UpdateProfile(BaseModel):
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    followers = db.query(Follow).filter(Follow.following_id == current_user.id).count()
    following = db.query(Follow).filter(Follow.follower_id == current_user.id).count()
    posts = db.query(Post).filter(Post.user_id == current_user.id).count()
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "posts_count": posts,
        "followers_count": followers,
        "following_count": following,
    }

@router.put("/me")
def update_profile(data: UpdateProfile, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if data.bio is not None:
        current_user.bio = data.bio
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated"}

@router.get("/search")
def search_users(q: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(User.username.ilike(f"%{q}%")).limit(10).all()
    return [{"id": u.id, "username": u.username, "avatar_url": u.avatar_url} for u in users]

@router.get("/{username}")
def get_user_profile(username: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    followers = db.query(Follow).filter(Follow.following_id == user.id).count()
    following = db.query(Follow).filter(Follow.follower_id == user.id).count()
    posts = db.query(Post).filter(Post.user_id == user.id).order_by(Post.created_at.desc()).all()
    is_following = db.query(Follow).filter(Follow.follower_id == current_user.id, Follow.following_id == user.id).first() is not None

    return {
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "posts_count": len(posts),
        "followers_count": followers,
        "following_count": following,
        "is_following": is_following,
        "posts": [{"id": p.id, "image_url": p.image_url, "caption": p.caption, "created_at": p.created_at} for p in posts],
    }