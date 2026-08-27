from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Optional
from utils.database import Base, SessionLocal


class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    perspective = Column(Text, nullable=False)
    introContentHeading = Column(Text, nullable=True)
    introContent = Column(Text, nullable=True)
    contentHeading = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    popularity = Column(String, default="medium")
    primary_image = Column(String, nullable=True)   
    secondary_image = Column(String, nullable=True)   
    views = Column(Integer, default=0)
    published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    favorites = relationship("LikedBlog", back_populates="blog")
    author = relationship("User", backref="blogs")
    

    @property
    def likes(self):
        return len(self.favorites)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="comments")
    blog = relationship("Blog", backref="comments")


class LikedBlog(Base):
    __tablename__ = "liked_blogs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blog_id = Column(Integer, ForeignKey("blogs.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    blog = relationship("Blog", back_populates="favorites")
    user = relationship("User", backref="favorites")


class BlogView(Base):
    __tablename__ = "blog_views"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    blog_id = Column(
        Integer,
        ForeignKey("blogs.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship("User", backref="blog_views")
    blog = relationship("Blog", backref="view_records")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "blog_id",
            name="uq_user_blog_view"
        ),
    )

class BlogBase(BaseModel):
    title: str
    perspective: str
    introContentHeading: Optional[str] = None
    introContent: Optional[str] = None
    contentHeading: Optional[str] = None
    content: Optional[str] = None
    category: str
    popularity: str = "medium"
    primary_image: Optional[str] = None
    secondary_image: Optional[str] = None


class BlogCreate(BlogBase):
    """For incoming POST request body"""
    pass


class BlogModel(BlogBase):
    id: int
    slug: str
    views: int   
    published: bool
    likes: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CommentBase(BaseModel):
    blog_id: int
    text: str

class CommentCreate(CommentBase):
    pass

class CommentModel(CommentBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CommentWithUser(CommentModel):
    user_name: str
    user_email: str | None = None
    user_image: str | None = None

    class Config:
        from_attributes = True




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


