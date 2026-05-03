"""
Book Repository – Persistence layer for Book operations.
"""
import uuid
from typing import Sequence

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Book
from app.schemas.schemas import BookCreateRequest, BookSearchParams, BookUpdateRequest


class BookRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(self, data: BookCreateRequest, editor_id: uuid.UUID) -> Book:
        book = Book(**data.model_dump(), editor_id=editor_id)
        self._db.add(book)
        await self._db.flush()
        await self._db.refresh(book)
        return book

    async def get_by_id(self, book_id: uuid.UUID) -> Book | None:
        result = await self._db.execute(select(Book).where(Book.id == book_id))
        return result.scalar_one_or_none()

    async def get_by_isbn(self, isbn: str) -> Book | None:
        result = await self._db.execute(select(Book).where(Book.isbn == isbn))
        return result.scalar_one_or_none()

    async def update(self, book: Book, data: BookUpdateRequest) -> Book:
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(book, field, value)
        await self._db.flush()
        await self._db.refresh(book)
        return book

    async def delete(self, book: Book) -> None:
        await self._db.delete(book)
        await self._db.flush()

    async def search(
        self, params: BookSearchParams, *, editor_id: uuid.UUID | None = None
    ) -> tuple[int, Sequence[Book]]:
        q = select(Book)

        if editor_id:
            q = q.where(Book.editor_id == editor_id)

        if params.q:
            term = f"%{params.q}%"
            q = q.where(
                or_(
                    Book.title.ilike(term),
                    Book.author.ilike(term),
                    Book.description.ilike(term),
                    Book.isbn.ilike(term),
                )
            )

        if params.author:
            q = q.where(Book.author.ilike(f"%{params.author}%"))
        if params.genre:
            q = q.where(Book.genre.ilike(f"%{params.genre}%"))
        if params.category:
            q = q.where(Book.category.ilike(f"%{params.category}%"))
        if params.language:
            q = q.where(Book.language.ilike(f"%{params.language}%"))
        if params.published_after:
            q = q.where(Book.published_date >= params.published_after)
        if params.published_before:
            q = q.where(Book.published_date <= params.published_before)

        count_q = select(func.count()).select_from(q.subquery())
        total = (await self._db.execute(count_q)).scalar_one()

        offset = (params.page - 1) * params.page_size
        q = q.offset(offset).limit(params.page_size).order_by(Book.created_at.desc())
        items = (await self._db.execute(q)).scalars().all()

        return total, items

    async def list_by_editor(self, editor_id: uuid.UUID) -> Sequence[Book]:
        result = await self._db.execute(
            select(Book).where(Book.editor_id == editor_id).order_by(Book.created_at.desc())
        )
        return result.scalars().all()
