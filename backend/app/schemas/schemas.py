"""
Pydantic v2 schemas for request/response validation and serialization.
"""
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.models import UserRole, UserStatus


# ── Shared / Base Schemas ─────────────────────────────────────

class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime


# ── Auth Schemas ──────────────────────────────────────────────

class RegisterClientRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class RegisterEditorRequest(RegisterClientRequest):
    pass  # same fields; role is set server-side


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── User Schemas ──────────────────────────────────────────────

class UserResponse(TimestampMixin):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    status: UserStatus
    is_active: bool

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    total: int
    items: list[UserResponse]


class UpdateUserStatusRequest(BaseModel):
    status: UserStatus


# ── Book Schemas ──────────────────────────────────────────────

class BookCreateRequest(BaseModel):
    isbn: str | None = Field(None, max_length=20)
    title: str = Field(min_length=1, max_length=500)
    author: str = Field(min_length=1, max_length=255)
    description: str | None = None
    cover_image_url: str | None = Field(None, max_length=1000)
    genre: str | None = Field(None, max_length=100)
    category: str | None = Field(None, max_length=100)
    language: str | None = Field(None, max_length=50)
    publisher: str | None = Field(None, max_length=255)
    published_date: str | None = Field(None, max_length=20)
    page_count: int | None = None
    price: str | None = Field(None, max_length=20)
    is_published: bool = True


class BookUpdateRequest(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    author: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    cover_image_url: str | None = None
    genre: str | None = None
    category: str | None = None
    language: str | None = None
    publisher: str | None = None
    published_date: str | None = None
    page_count: int | None = None
    price: str | None = None
    is_published: bool | None = None


class BookResponse(TimestampMixin):
    id: uuid.UUID
    isbn: str | None
    title: str
    author: str
    description: str | None
    cover_image_url: str | None
    genre: str | None
    category: str | None
    language: str | None
    publisher: str | None
    published_date: str | None
    page_count: int | None
    price: str | None
    is_published: bool
    editor_id: uuid.UUID

    model_config = {"from_attributes": True}


class BookListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[BookResponse]


class BookSearchParams(BaseModel):
    q: str | None = None
    author: str | None = None
    genre: str | None = None
    category: str | None = None
    language: str | None = None
    published_after: str | None = None
    published_before: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=100)


# ── ISBN Auto-fill Schema ─────────────────────────────────────

class ISBNLookupResponse(BaseModel):
    isbn: str
    title: str | None
    author: str | None
    description: str | None
    cover_image_url: str | None
    genre: str | None
    category: str | None
    language: str | None
    publisher: str | None
    published_date: str | None
    page_count: int | None
