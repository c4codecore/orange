from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.dependencies import get_current_user
from app.core.config import settings
from app.core.websocket_manager import manager      
import httpx
import uuid

router = APIRouter()

async def upload_to_supabase(file: UploadFile) -> str:
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_bytes = await file.read()

    url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}/{file_name}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "Content-Type": file.content_type,
            },
            content=file_bytes,
        )

    if response.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail="Image upload failed")

    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{file_name}"


async def delete_from_supabase(image_url: str):
    try:
        file_name = image_url.split(f"/{settings.SUPABASE_BUCKET}/")[-1]
        url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}/{file_name}"
        async with httpx.AsyncClient() as client:
            await client.delete(
                url,
                headers={"Authorization": f"Bearer {settings.SUPABASE_KEY}"}
            )
    except Exception:
        pass


@router.post("/")
async def create_post(
    caption: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if caption and len(caption) > 500:
        raise HTTPException(status_code=400, detail="Caption 500 characters se zyada nahi ho sakta")

    image_url = await upload_to_supabase(image)

    post = Post(
        image_url=image_url,
        caption=caption,
        user_id=current_user.id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    await manager.broadcast({
    "type": "post_added",
    "post_id": post.id,
    "user_id": post.user_id,
    })

    return {
        "id": post.id,
        "image_url": post.image_url,
        "caption": post.caption,
        "user_id": post.user_id,
        "created_at": post.created_at,
    }


@router.get("/feed")
def get_feed(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.likes),
            joinedload(Post.comments),
        )
        .order_by(Post.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": p.id,
            "image_url": p.image_url,
            "caption": p.caption,
            "author": p.author.username,
            "author_id": p.author.id,
            "author_avatar_url": p.author.avatar_url,
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "liked": any(l.user_id == current_user.id for l in p.likes),
            "created_at": p.created_at,
        }
        for p in posts
    ]


@router.get("/my")
def get_my_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.likes), joinedload(Post.comments))
        .filter(Post.user_id == current_user.id)
        .order_by(Post.created_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "image_url": p.image_url,
            "caption": p.caption,
            "likes_count": len(p.likes),
            "comments_count": len(p.comments),
            "created_at": p.created_at,
        }
        for p in posts
    ]


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")

    image_url = post.image_url
    db.delete(post)
    db.commit()

    await delete_from_supabase(image_url)
    await manager.broadcast({
    "type": "post_deleted",
    "post_id": post_id,
    })

    return {"message": "Post deleted"}