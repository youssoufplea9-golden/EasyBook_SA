"""
Book Service – Business logic for catalog management.
"""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.models.models import UserRole
from app.repositories.book_repository import BookRepository
from app.schemas.schemas import (
    BookCreateRequest,
    BookListResponse,
    BookResponse,
    BookSearchParams,
    BookUpdateRequest,
    UserResponse,
)


class BookService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = BookRepository(db)

    async def create_book(
        self, data: BookCreateRequest, current_user: UserResponse
    ) -> BookResponse:
        if data.isbn and await self._repo.get_by_isbn(data.isbn):
            raise ConflictException(f"A book with ISBN {data.isbn} already exists")

        book = await self._repo.create(data, editor_id=current_user.id)
        return BookResponse.model_validate(book)

    async def get_book(self, book_id: uuid.UUID) -> BookResponse:
        book = await self._repo.get_by_id(book_id)
        if not book:
            raise NotFoundException("Book")
        return BookResponse.model_validate(book)

    async def update_book(
        self,
        book_id: uuid.UUID,
        data: BookUpdateRequest,
        current_user: UserResponse,
    ) -> BookResponse:
        book = await self._repo.get_by_id(book_id)
        if not book:
            raise NotFoundException("Book")

        # Editors can only edit their own books; Admins can edit any
        if current_user.role == UserRole.EDITOR and book.editor_id != current_user.id:
            raise ForbiddenException("You can only edit your own books")

        updated = await self._repo.update(book, data)
        return BookResponse.model_validate(updated)

    async def delete_book(
        self, book_id: uuid.UUID, current_user: UserResponse
    ) -> None:
        book = await self._repo.get_by_id(book_id)
        if not book:
            raise NotFoundException("Book")

        if current_user.role == UserRole.EDITOR and book.editor_id != current_user.id:
            raise ForbiddenException("You can only delete your own books")

        await self._repo.delete(book)

    async def search_books(
        self,
        params: BookSearchParams,
        *,
        editor_id: uuid.UUID | None = None,
    ) -> BookListResponse:
        total, items = await self._repo.search(params, editor_id=editor_id)
        return BookListResponse(
            total=total,
            page=params.page,
            page_size=params.page_size,
            items=[BookResponse.model_validate(b) for b in items],
        )

    async def get_editor_books(self, editor_id: uuid.UUID) -> list[BookResponse]:
        books = await self._repo.list_by_editor(editor_id)
        return [BookResponse.model_validate(b) for b in books]
