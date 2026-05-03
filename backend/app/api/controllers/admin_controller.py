"""
Admin Controller – Presentation layer for admin-only endpoints.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.middlewares.auth_middleware import RequireAdmin, CurrentUser
from app.models.models import UserStatus
from app.schemas.schemas import (
    UpdateUserStatusRequest,
    UserListResponse,
    UserResponse,
)
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


def _get_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AdminService:
    return AdminService(db)


@router.get("/editors/pending", response_model=list[UserResponse], dependencies=[RequireAdmin])
async def list_pending_editors(
    service: Annotated[AdminService, Depends(_get_service)],
):
    """List all editors awaiting approval."""
    return await service.list_pending_editors()


@router.post("/editors/{editor_id}/approve", response_model=UserResponse, dependencies=[RequireAdmin])
async def approve_editor(
    editor_id: uuid.UUID,
    service: Annotated[AdminService, Depends(_get_service)],
):
    """Approve a pending editor — sets status to ACTIVE."""
    return await service.approve_editor(editor_id)


@router.post("/editors/{editor_id}/reject", response_model=UserResponse, dependencies=[RequireAdmin])
async def reject_editor(
    editor_id: uuid.UUID,
    service: Annotated[AdminService, Depends(_get_service)],
):
    """Reject a pending editor — sets status to REJECTED."""
    return await service.reject_editor(editor_id)


@router.get("/users", response_model=UserListResponse, dependencies=[RequireAdmin])
async def list_all_users(
    service: Annotated[AdminService, Depends(_get_service)],
    skip: int = 0,
    limit: int = 50,
):
    """Paginated list of all users."""
    return await service.list_all_users(skip=skip, limit=limit)


@router.patch("/users/{user_id}/status", response_model=UserResponse, dependencies=[RequireAdmin])
async def update_user_status(
    user_id: uuid.UUID,
    data: UpdateUserStatusRequest,
    service: Annotated[AdminService, Depends(_get_service)],
):
    """Update any user's status."""
    return await service.update_user_status(user_id, data.status)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[RequireAdmin])
async def delete_user(
    user_id: uuid.UUID,
    service: Annotated[AdminService, Depends(_get_service)],
):
    """Permanently delete a user. Admins cannot be deleted."""
    await service.delete_user(user_id)
