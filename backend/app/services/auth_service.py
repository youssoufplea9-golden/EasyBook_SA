"""
Auth Service - Business logic for authentication and registration.
"""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ConflictException,
    CredentialsException,
    PendingApprovalException,
    RejectedAccountException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.models import UserRole, UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.schemas import (
    LoginRequest,
    RegisterClientRequest,
    RegisterEditorRequest,
    TokenResponse,
    UserResponse,
)


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = UserRepository(db)

    async def register_client(self, data: RegisterClientRequest) -> UserResponse:
        if await self._repo.email_exists(data.email):
            raise ConflictException("Email already registered")

        user = await self._repo.create(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=UserRole.CLIENT,
            status=UserStatus.ACTIVE,
        )
        return UserResponse.model_validate(user)

    async def register_editor(self, data: RegisterEditorRequest) -> UserResponse:
        if await self._repo.email_exists(data.email):
            raise ConflictException("Email already registered")

        user = await self._repo.create(
            email=data.email,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=UserRole.EDITOR,
            status=UserStatus.PENDING,
        )
        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self._repo.get_by_email(data.email)

        if not user or not verify_password(data.password, user.hashed_password):
            raise CredentialsException("Invalid email or password")

        if not user.is_active:
            raise CredentialsException("Account is deactivated")

        if user.status == UserStatus.PENDING:
            raise PendingApprovalException()
        if user.status == UserStatus.REJECTED:
            raise RejectedAccountException()

        return TokenResponse(
            access_token=create_access_token(
                subject=str(user.id),
                role=user.role.value,
                status=user.status.value,
            ),
            refresh_token=create_refresh_token(subject=str(user.id)),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise CredentialsException("Invalid token type")
            user_id_str: str = payload.get("sub", "")
        except Exception:
            raise CredentialsException("Invalid or expired refresh token")

        user = await self._repo.get_by_id(uuid.UUID(user_id_str))
        if not user or not user.is_active:
            raise CredentialsException()

        return TokenResponse(
            access_token=create_access_token(
                subject=str(user.id),
                role=user.role.value,
                status=user.status.value,
            ),
            refresh_token=create_refresh_token(subject=str(user.id)),
        )
