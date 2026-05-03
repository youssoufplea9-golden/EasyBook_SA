"""
Auth middleware – FastAPI dependency injection for JWT validation and RBAC.
"""
import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import CredentialsException, ForbiddenException
from app.core.security import decode_token
from app.db.session import AsyncSession, get_db
from app.models.models import UserRole, UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.schemas import UserResponse

_bearer = HTTPBearer(auto_error=False)


async def _get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    if not credentials:
        raise CredentialsException("No credentials provided")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise CredentialsException("Invalid token type")
        user_id: str = payload["sub"]
    except Exception:
        raise CredentialsException()

    repo = UserRepository(db)
    user = await repo.get_by_id(uuid.UUID(user_id))
    if not user or not user.is_active:
        raise CredentialsException("User not found or inactive")

    return UserResponse.model_validate(user)


# ── Public dependency ─────────────────────────────────────────

CurrentUser = Annotated[UserResponse, Depends(_get_current_user)]


# ── Role-based dependencies ───────────────────────────────────

def require_roles(*roles: UserRole):
    """Factory that returns a dependency enforcing one of the given roles."""

    async def _dep(current_user: CurrentUser) -> UserResponse:
        if current_user.role not in roles:
            raise ForbiddenException(
                f"Access restricted to: {', '.join(r.value for r in roles)}"
            )
        # Extra check: editors must be ACTIVE
        if (
            current_user.role == UserRole.EDITOR
            and current_user.status != UserStatus.ACTIVE
        ):
            if current_user.status == UserStatus.PENDING:
                from app.core.exceptions import PendingApprovalException
                raise PendingApprovalException()
            from app.core.exceptions import RejectedAccountException
            raise RejectedAccountException()
        return current_user

    return _dep


RequireAdmin = Depends(require_roles(UserRole.ADMIN))
RequireEditor = Depends(require_roles(UserRole.EDITOR, UserRole.ADMIN))
RequireClient = Depends(require_roles(UserRole.CLIENT, UserRole.EDITOR, UserRole.ADMIN))
