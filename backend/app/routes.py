import os
import shutil
from typing import List
import uuid
from fastapi import APIRouter, File, HTTPException, Depends, UploadFile
from sqlalchemy.orm import Session
from utils import models
from utils.database import engine
from typing import Annotated
from utils.auth import get_current_user  
from utils.utils import generate_slug  

db_dependency = Annotated[Session, Depends(models.get_db)]
models.Base.metadata.create_all(bind=engine)

router = APIRouter()




@router.post("/blogs", response_model=models.BlogModel)
async def create_blog(blog: models.BlogCreate, db: db_dependency):
    slug = generate_slug(blog.title) 

    new_blog = models.Blog(
        title=blog.title,
        slug=slug,
        perspective=blog.perspective,
        introContentHeading=blog.introContentHeading,
        introContent=blog.introContent,
        contentHeading=blog.contentHeading,
        content=blog.content,
       category=generate_slug(blog.category),
        popularity=blog.popularity,
        primary_image=blog.primary_image,
        secondary_image=blog.secondary_image,
    )

    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog


@router.post("/upload-images")
async def upload_images(
    primary_image: UploadFile = File(...),
    secondary_image: UploadFile = File(None)
):
   
    primary_filename = f"{uuid.uuid4().hex}_{primary_image.filename}"
    primary_path = os.path.join("static", primary_filename)
    
    with open(primary_path, "wb") as buffer:
        shutil.copyfileobj(primary_image.file, buffer)
    

    secondary_path = None
    if secondary_image:
        secondary_filename = f"{uuid.uuid4().hex}_{secondary_image.filename}"
        secondary_path = os.path.join("static", secondary_filename)
        
        with open(secondary_path, "wb") as buffer:
            shutil.copyfileobj(secondary_image.file, buffer)
    
    return {
        "primary": primary_path,
        "secondary": secondary_path
    }
    
@router.get("/blogs", response_model=List[models.BlogModel])
async def get_all_blogs(db: db_dependency):
    return db.query(models.Blog).all()

@router.get("/blogs/{slug}", response_model=models.BlogModel)
async def get_single_blog(slug: str, db: db_dependency):
    blog = db.query(models.Blog).filter(models.Blog.slug == slug).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return blog

@router.get("/blogs/category/{category}", response_model=List[models.BlogModel])
async def get_blog_by_category(category: str, db: db_dependency):
    blog = db.query(models.Blog).filter(models.Blog.category == category.lower()).all()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.post("/comments", response_model=models.CommentModel)
async def add_comment(comment: models.CommentCreate, db: db_dependency, user: models.User = Depends(get_current_user)):
    new_comment = models.Comment(
        blog_id=comment.blog_id,
        user_id=user.id,
        text=comment.text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    comment = (
        db.query(models.Comment)
        .filter(
            models.Comment.id == comment_id,
            models.Comment.user_id == user.id
        )
        .first()
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found or you are not authorized to delete it"
        )

    db.delete(comment)
    db.commit()

    return {"message": "Comment deleted successfully"}


@router.get("/blogs/{blog_id}/comments", response_model=List[models.CommentWithUser])
async def get_comments_for_blog(blog_id: int, db: db_dependency):
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.blog_id == blog_id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )

    return [
        models.CommentWithUser(
    id=c.id,
    blog_id=c.blog_id,
    text=c.text,
    created_at=c.created_at,
    user_id=c.user_id,
    user_name=c.user.name,
    user_email=c.user.email,
    user_image=None, 
)
        for c in comments
    ]


@router.post("/liked-blogs/{blog_id}")
async def add_liked(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    existing = (
        db.query(models.LikedBlog)
        .filter(
            models.LikedBlog.user_id == user.id,
            models.LikedBlog.blog_id == blog_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already added to liked")

    liked = models.LikedBlog(
        user_id=user.id,
        blog_id=blog_id
    )

    db.add(liked)
    db.commit()

    return {"message": "Blog added to Liked"}



@router.delete("/liked-blogs/{blog_id}")
async def remove_liked(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    liked = (
        db.query(models.LikedBlog)
        .filter(
            models.LikedBlog.user_id == user.id,
            models.LikedBlog.blog_id == blog_id
        )
        .first()
    )

    if not liked:
        raise HTTPException(status_code=404, detail="Liked not found")

    db.delete(liked)
    db.commit()

    return {"message": "Removed from liked"}


@router.get("/liked-blogs", response_model=List[models.BlogModel])
async def get_my_liked(
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blogs = (
        db.query(models.Blog)
        .join(models.LikedBlog, models.Blog.id == models.LikedBlog.blog_id)
        .filter(models.LikedBlog.user_id == user.id)
        .all()
    )

    return blogs


@router.get("/liked-blogs/{blog_id}")
async def is_liked(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    liked = (
        db.query(models.LikedBlog)
        .filter(
            models.LikedBlog.user_id == user.id,
            models.LikedBlog.blog_id == blog_id
        )
        .first()
    )

    return {
        "liked": liked is not None
    }


@router.get("/liked-blogs/{blog_id}/count")
async def get_like_count(blog_id: int, db: db_dependency):
    count = (
        db.query(models.LikedBlog)
        .filter(models.LikedBlog.blog_id == blog_id)
        .count()
    )

    return {"count": count}


@router.post("/blogs/{blog_id}/view")
async def increment_view(blog_id: int, db: db_dependency):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    blog.views += 1
    db.commit()

    return {"views": blog.views}