
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.orm import Session
from utils.models import User, get_db
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import jwt as pyjwt
import os
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30  # matches NextAuth session maxAge

security = HTTPBearer()


def create_backend_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_google_and_get_or_create_user(google_id_token: str, db: Session) -> User:
    try:
        idinfo = id_token.verify_oauth2_token(
            google_id_token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError as e:
        logger.error(f"Google token validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")

    if idinfo["aud"] != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Invalid audience")

    email = idinfo.get("email")
    name = idinfo.get("name")

    if not email:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(name=name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except pyjwt.InvalidTokenError as e:
        logger.error(f"Invalid backend token: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user