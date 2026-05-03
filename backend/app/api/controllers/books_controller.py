"""
Books Controller - Presentation layer for book catalog endpoints.

NOTE: Route order matters in FastAPI. Static paths (/isbn/{isbn}, /editor/my-books)
MUST be registered BEFORE dynamic paths (/{book_id}) to avoid conflicts.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middlewares.auth_middleware import (
    CurrentUser,
    RequireAdmin,
    RequireClient,
    RequireEditor,
)
from app.schemas.schemas import (
    BookCreateRequest,
    BookListResponse,
    BookResponse,
    BookSearchParams,
    BookUpdateRequest,
    ISBNLookupResponse,
)
from app.services.book_lookup_service import BookLookupService
from app.services.book_service import BookService

router = APIRouter(prefix="/books", tags=["Books"])


def _get_service(db: Annotated[AsyncSession, Depends(get_db)]) -> BookService:
    return BookService(db)


# ── Static routes FIRST (must come before /{book_id}) ────────

@router.get("/editor/my-books", response_model=list[BookResponse])
async def my_books(
    service: Annotated[BookService, Depends(_get_service)],
    current_user: CurrentUser,
    _: Annotated[None, RequireEditor] = None,
):
    """List all books belonging to the authenticated editor."""
    return await service.get_editor_books(current_user.id)


@router.get("/isbn/{isbn}", response_model=ISBNLookupResponse | None)
async def lookup_isbn(
    isbn: str,
    _: Annotated[None, RequireEditor] = None,
):
    """
    Auto-fill book metadata from Open Library / Google Books by ISBN.
    Returns null if not found.
    """
    lookup = BookLookupService()
    try:
        return await lookup.lookup_by_isbn(isbn)
    finally:
        await lookup.aclose()


# ── Collection routes ─────────────────────────────────────────

@router.get("", response_model=BookListResponse, dependencies=[RequireClient])
async def search_books(
    service: Annotated[BookService, Depends(_get_service)],
    q: str | None = Query(None),
    author: str | None = Query(None),
    genre: str | None = Query(None),
    category: str | None = Query(None),
    language: str | None = Query(None),
    published_after: str | None = Query(None),
    published_before: str | None = Query(None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
):
    """Advanced catalog search with multiple filters."""
    params = BookSearchParams(
        q=q, author=author, genre=genre, category=category,
        language=language, published_after=published_after,
        published_before=published_before, page=page, page_size=page_size,
    )
    return await service.search_books(params)


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    data: BookCreateRequest,
    service: Annotated[BookService, Depends(_get_service)],
    current_user: CurrentUser,
    _: Annotated[None, RequireEditor] = None,
):
    return await service.create_book(data, current_user)


# ── Dynamic /{book_id} routes LAST ───────────────────────────

@router.get("/{book_id}", response_model=BookResponse, dependencies=[RequireClient])
async def get_book(
    book_id: uuid.UUID,
    service: Annotated[BookService, Depends(_get_service)],
):
    return await service.get_book(book_id)


@router.patch("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: uuid.UUID,
    data: BookUpdateRequest,
    service: Annotated[BookService, Depends(_get_service)],
    current_user: CurrentUser,
    _: Annotated[None, RequireEditor] = None,
):
    return await service.update_book(book_id, data, current_user)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: uuid.UUID,
    service: Annotated[BookService, Depends(_get_service)],
    current_user: CurrentUser,
    _: Annotated[None, RequireEditor] = None,
):
    await service.delete_book(book_id, current_user)
