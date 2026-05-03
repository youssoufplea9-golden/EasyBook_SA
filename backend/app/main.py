"""
EasyBook – FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.controllers import admin_controller, auth_controller, books_controller
from app.core.config import get_settings
from app.db.session import engine
from app.models.models import Base  # noqa: F401 – registers all models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: seed admin user if DB is fresh."""
    logger.info("EasyBook API starting up...")
    await _seed_admin()
    yield
    logger.info("EasyBook API shutting down...")
    await engine.dispose()


async def _seed_admin() -> None:
    """Create the default admin user if it doesn't exist yet."""
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.db.session import AsyncSessionLocal
    from app.models.models import UserRole, UserStatus
    from app.core.security import hash_password
    from app.repositories.user_repository import UserRepository

    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        if not await repo.email_exists(settings.FIRST_ADMIN_EMAIL):
            await repo.create(
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="System Admin",
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
            )
            await db.commit()
            logger.info("✔ Admin user seeded: %s", settings.FIRST_ADMIN_EMAIL)


app = FastAPI(
    title=settings.APP_NAME,
    description="Digital Bookstore REST API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
PREFIX = settings.API_V1_PREFIX

app.include_router(auth_controller.router, prefix=PREFIX)
app.include_router(admin_controller.router, prefix=PREFIX)
app.include_router(books_controller.router, prefix=PREFIX)


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return JSONResponse({"status": "ok", "app": settings.APP_NAME})
