"""
Admin Service – Business logic for admin operations.
"""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.models import UserRole, UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.schemas import UserListResponse, UserResponse


class AdminService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    async def list_pending_editors(self) -> list[UserResponse]:
        users = await self._repo.list_pending_editors()
        return [UserResponse.model_validate(u) for u in users]

    async def approve_editor(self, editor_id: uuid.UUID) -> UserResponse:
        user = await self._repo.get_by_id(editor_id)
        if not user:
            raise NotFoundException("User")
        if user.role != UserRole.EDITOR:
            raise ForbiddenException("Target user is not an editor")

        updated = await self._repo.update_status(editor_id, UserStatus.ACTIVE)
        return UserResponse.model_validate(updated)

    async def reject_editor(self, editor_id: uuid.UUID) -> UserResponse:
        user = await self._repo.get_by_id(editor_id)
        if not user:
            raise NotFoundException("User")
        if user.role != UserRole.EDITOR:
            raise ForbiddenException("Target user is not an editor")

        updated = await self._repo.update_status(editor_id, UserStatus.REJECTED)
        return UserResponse.model_validate(updated)

    async def list_all_users(
        self, *, skip: int = 0, limit: int = 50
    ) -> UserListResponse:
        total, users = await self._repo.list_all(skip=skip, limit=limit)
        return UserListResponse(
            total=total,
            items=[UserResponse.model_validate(u) for u in users],
        )

    async def update_user_status(
        self, user_id: uuid.UUID, status: UserStatus
    ) -> UserResponse:
        user = await self._repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User")

        updated = await self._repo.update_status(user_id, status)
        return UserResponse.model_validate(updated)
