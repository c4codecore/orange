from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.like import Like
from app.models.post import Post
from app.dependencies import get_current_user
from app.models.user import User
from app.core.websocket_manager import manager

router = APIRouter()

@router.post("/{post_id}")
async def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(Like).filter(Like.user_id == current_user.id, Like.post_id == post_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")

    like = Like(user_id=current_user.id, post_id=post_id)
    db.add(like)
    db.commit()

    # Sab users ko broadcast karo
    await manager.broadcast({
        "type": "like_added",
        "post_id": post_id,
        "user_id": current_user.id,
    })

    return {"message": "Post liked"}

@router.delete("/{post_id}")
async def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    like = db.query(Like).filter(Like.user_id == current_user.id, Like.post_id == post_id).first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    db.delete(like)
    db.commit()

    await manager.broadcast({
        "type": "like_removed",
        "post_id": post_id,
        "user_id": current_user.id,
    })

    return {"message": "Post unliked"}