"""
Auth Controller – Presentation layer for authentication endpoints.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middlewares.auth_middleware import CurrentUser
from app.schemas.schemas import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterClientRequest,
    RegisterEditorRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AuthService:
    return AuthService(db)


@router.post("/register/client", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_client(
    data: RegisterClientRequest,
    service: Annotated[AuthService, Depends(_get_service)],
):
    """Register a new Client. Account is immediately active."""
    return await service.register_client(data)


@router.post("/register/editor", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_editor(
    data: RegisterEditorRequest,
    service: Annotated[AuthService, Depends(_get_service)],
):
    """Register a new Editor. Account requires admin approval before login."""
    return await service.register_editor(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    service: Annotated[AuthService, Depends(_get_service)],
):
    """Obtain access + refresh tokens."""
    return await service.login(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshTokenRequest,
    service: Annotated[AuthService, Depends(_get_service)],
):
    """Exchange a refresh token for a new token pair."""
    return await service.refresh(data.refresh_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser):
    """Return the currently authenticated user."""
    return current_user
