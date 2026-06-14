from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.follow import Follow
from app.models.user import User
from app.dependencies import get_current_user
from app.core.websocket_manager import manager

router = APIRouter()

@router.post("/{user_id}")
async def follow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already following")

    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    db.commit()

    await manager.broadcast({
        "type": "follow_added",
        "follower_id": current_user.id,
        "following_id": user_id,
    })

    return {"message": f"Now following {target.username}"}

@router.delete("/{user_id}")
async def unfollow_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")

    db.delete(follow)
    db.commit()

    await manager.broadcast({
        "type": "follow_removed",
        "follower_id": current_user.id,
        "following_id": user_id,
    })

    return {"message": "Unfollowed"}