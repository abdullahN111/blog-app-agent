# auth.py

from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from utils.models import User, get_db
from dotenv import load_dotenv
import os
import jwt
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

NEXTAUTH_SECRET = os.getenv("NEXTAUTH_SECRET")

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials

        if not NEXTAUTH_SECRET:
            logger.error("NEXTAUTH_SECRET is missing")
            raise HTTPException(
                status_code=500,
                detail="Authentication configuration error"
            )

        # Verify our backend JWT
        payload = jwt.decode(
            token,
            NEXTAUTH_SECRET,
            algorithms=["HS256"]
        )

        email = payload.get("email")
        name = payload.get("name")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )

        # Find user in database
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        # Create user if they don't exist
        if not user:
            user = User(
                name=name or email.split("@")[0],
                email=email
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    except jwt.ExpiredSignatureError:
        logger.warning("Backend authentication token expired")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token expired"
        )

    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid backend token: {e}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Authentication error: {e}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )