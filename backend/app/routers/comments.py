from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.comment import Comment
from app.models.post import Post
from app.dependencies import get_current_user
from app.models.user import User
from app.core.websocket_manager import manager
from pydantic import BaseModel

router = APIRouter()

class CommentCreate(BaseModel):
    content: str

@router.post("/{post_id}")
async def add_comment(post_id: int, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(content=data.content, user_id=current_user.id, post_id=post_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    await manager.broadcast({
        "type": "comment_added",
        "post_id": post_id,
        "comment_id": comment.id,
        "user_id": current_user.id,
        "author": current_user.username,
        "content": data.content,
    })

    return {
        "id": comment.id,
        "content": comment.content,
        "author": current_user.username,
        "created_at": comment.created_at,
    }

@router.get("/{post_id}")
def get_comments(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return [
        {
            "id": c.id,
            "content": c.content,
            "author": c.author.username,
            "created_at": c.created_at,
        }
        for c in comments
    ]

@router.delete("/{comment_id}")
async def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your comment")

    post_id = comment.post_id
    db.delete(comment)
    db.commit()

    await manager.broadcast({
        "type": "comment_removed",
        "post_id": post_id,
        "comment_id": comment_id,
    })

    return {"message": "Comment deleted"}