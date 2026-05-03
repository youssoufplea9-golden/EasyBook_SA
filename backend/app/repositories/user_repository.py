"""
User Repository – Persistence layer for User operations.
Completely decoupled from business logic.
"""
import uuid
from typing import Sequence

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User, UserRole, UserStatus


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create(
        self,
        *,
        email: str,
        full_name: str,
        hashed_password: str,
        role: UserRole,
        status: UserStatus,
    ) -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
            status=status,
        )
        self._db.add(user)
        await self._db.flush()
        await self._db.refresh(user)
        return user

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self._db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def list_by_role(
        self, role: UserRole, *, skip: int = 0, limit: int = 50
    ) -> tuple[int, Sequence[User]]:
        count_q = select(func.count()).select_from(User).where(User.role == role)
        total = (await self._db.execute(count_q)).scalar_one()

        q = select(User).where(User.role == role).offset(skip).limit(limit)
        items = (await self._db.execute(q)).scalars().all()
        return total, items

    async def list_pending_editors(self) -> Sequence[User]:
        q = select(User).where(
            User.role == UserRole.EDITOR, User.status == UserStatus.PENDING
        )
        return (await self._db.execute(q)).scalars().all()

    async def update_status(self, user_id: uuid.UUID, status: UserStatus) -> User | None:
        await self._db.execute(
            update(User).where(User.id == user_id).values(status=status)
        )
        return await self.get_by_id(user_id)

    async def list_all(
        self, *, skip: int = 0, limit: int = 50
    ) -> tuple[int, Sequence[User]]:
        total = (await self._db.execute(select(func.count()).select_from(User))).scalar_one()
        items = (
            await self._db.execute(select(User).offset(skip).limit(limit))
        ).scalars().all()
        return total, items

    async def email_exists(self, email: str) -> bool:
        result = await self._db.execute(
            select(func.count()).select_from(User).where(User.email == email)
        )
        return result.scalar_one() > 0
