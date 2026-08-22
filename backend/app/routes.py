import os
import shutil
from typing import List
import uuid
from fastapi import APIRouter, File, HTTPException, Depends, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils import models
from utils.database import engine
from typing import Annotated
from utils.auth import get_current_user  
from utils.utils import generate_slug  
from utils.auth import verify_google_and_get_or_create_user, create_backend_token

db_dependency = Annotated[Session, Depends(models.get_db)]
models.Base.metadata.create_all(bind=engine)

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str

 


@router.post("/blogs", response_model=models.BlogModel)
async def create_blog(blog: models.BlogCreate,
    db: db_dependency,
    user: models.User = Depends(get_current_user)):
    slug = generate_slug(blog.title) 

    new_blog = models.Blog(
        user_id=user.id,
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
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_dir = os.path.join(base_dir, "static")

    os.makedirs(static_dir, exist_ok=True)

    primary_filename = f"{uuid.uuid4().hex}_{primary_image.filename}"
    primary_path = os.path.join(static_dir, primary_filename)

    with open(primary_path, "wb") as buffer:
        shutil.copyfileobj(primary_image.file, buffer)

    secondary_path = None

    if secondary_image:
        secondary_filename = f"{uuid.uuid4().hex}_{secondary_image.filename}"
        secondary_path = os.path.join(static_dir, secondary_filename)

        with open(secondary_path, "wb") as buffer:
            shutil.copyfileobj(secondary_image.file, buffer)

    return {
        "primary": f"static/{primary_filename}",
        "secondary": (
            f"static/{secondary_filename}"
            if secondary_image
            else None
        ),
    }
    
@router.get("/blogs", response_model=List[models.BlogModel])
async def get_all_blogs(db: db_dependency):
    return (
        db.query(models.Blog)
        .filter(models.Blog.published.is_(True))
        .all()
    )
    
    
@router.get("/blogs/id/{blog_id}", response_model=models.BlogModel)
async def get_blog_by_id(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.user_id == user.id
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found or you are not authorized"
        )

    return blog

@router.get("/blogs/{slug}", response_model=models.BlogModel)
async def get_single_blog(slug: str, db: db_dependency):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.slug == slug,
            models.Blog.published.is_(True)
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    return blog

@router.get(
    "/blogs/category/{category}",
    response_model=List[models.BlogModel]
)
async def get_blog_by_category(
    category: str,
    db: db_dependency
):
    blogs = (
        db.query(models.Blog)
        .filter(
            models.Blog.category == category.lower(),
            models.Blog.published.is_(True)
        )
        .all()
    )

    if not blogs:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    return blogs


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
async def record_blog_view(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.published.is_(True)
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    existing_view = (
        db.query(models.BlogView)
        .filter(
            models.BlogView.user_id == user.id,
            models.BlogView.blog_id == blog_id
        )
        .first()
    )

    if existing_view:
        return {
            "viewed": True,
            "new_view": False,
            "views": blog.views
        }

    new_view = models.BlogView(
        user_id=user.id,
        blog_id=blog_id
    )

    db.add(new_view)

    blog.views += 1

    db.commit()

    return {
        "viewed": True,
        "new_view": True,
        "views": blog.views
    }


@router.get("/my-blogs", response_model=List[models.BlogModel])
async def get_my_blogs(
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.Blog)
        .filter(models.Blog.user_id == user.id)
        .all()
    )
    
    
@router.patch("/blogs/{blog_id}/publish")
async def publish_blog(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.user_id == user.id
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    blog.published = True

    db.commit()
    db.refresh(blog)

    return {
        "message": "Blog published successfully",
        "published": blog.published
    }
    

@router.patch("/blogs/{blog_id}/unpublish")
async def unpublish_blog(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.user_id == user.id
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    blog.published = False

    db.commit()
    db.refresh(blog)

    return {
        "message": "Blog unpublished successfully",
        "published": blog.published
    }

@router.delete("/blogs/{blog_id}")
async def delete_blog(
    blog_id: int,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.user_id == user.id
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found or you are not authorized"
        )

    db.query(models.LikedBlog).filter(
        models.LikedBlog.blog_id == blog_id
    ).delete(synchronize_session=False)

    db.query(models.Comment).filter(
        models.Comment.blog_id == blog_id
    ).delete(synchronize_session=False)


    for image_path in [blog.primary_image, blog.secondary_image]:
        if image_path:
            image_file = image_path.replace("\\", "/")

            if image_file.startswith("static/"):
                if os.path.exists(image_file):
                    os.remove(image_file)

    db.delete(blog)
    db.commit()

    return {
        "message": "Blog deleted successfully"
    }
    

@router.put("/blogs/{blog_id}", response_model=models.BlogModel)
async def update_blog(
    blog_id: int,
    blog_data: models.BlogCreate,
    db: db_dependency,
    user: models.User = Depends(get_current_user)
):
    blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.id == blog_id,
            models.Blog.user_id == user.id
        )
        .first()
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found or you are not authorized"
        )

    new_slug = generate_slug(blog_data.title)

    existing_blog = (
        db.query(models.Blog)
        .filter(
            models.Blog.slug == new_slug,
            models.Blog.id != blog_id
        )
        .first()
    )

    if existing_blog:
        raise HTTPException(
            status_code=400,
            detail="Another blog already uses this title/slug"
        )

    blog.title = blog_data.title
    blog.slug = new_slug

    blog.perspective = blog_data.perspective

    blog.introContentHeading = blog_data.introContentHeading
    blog.introContent = blog_data.introContent

    blog.contentHeading = blog_data.contentHeading
    blog.content = blog_data.content

    blog.category = generate_slug(blog_data.category)
    blog.popularity = blog_data.popularity

    blog.primary_image = blog_data.primary_image
    blog.secondary_image = blog_data.secondary_image

    db.commit()
    db.refresh(blog)

    return blog


@router.post("/auth/google")
async def google_login(body: GoogleLoginRequest, db: db_dependency):
    user = verify_google_and_get_or_create_user(body.id_token, db)
    token = create_backend_token(user)

    return {
        "access_token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name},
    }