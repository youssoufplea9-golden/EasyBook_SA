"""Initial schema: users and books tables

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enums ───────────────────────────────────────────────
    # Use DO block to create enums conditionally
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'CLIENT');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # ── Users table ─────────────────────────────────────────
    # Use raw SQL to avoid SQLAlchemy trying to recreate enums
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            role user_role NOT NULL,
            status user_status NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)")

    # ── Books table ──────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id UUID PRIMARY KEY,
            isbn VARCHAR(20) UNIQUE,
            title VARCHAR(500) NOT NULL,
            author VARCHAR(255) NOT NULL,
            description TEXT,
            cover_image_url VARCHAR(1000),
            genre VARCHAR(100),
            category VARCHAR(100),
            language VARCHAR(50),
            publisher VARCHAR(255),
            published_date VARCHAR(20),
            page_count INTEGER,
            price VARCHAR(20),
            is_published BOOLEAN NOT NULL DEFAULT true,
            editor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_books_isbn ON books (isbn)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_books_title ON books (title)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_books_author ON books (author)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_books_genre ON books (genre)")


def downgrade() -> None:
    op.drop_table("books")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS user_role")
    op.execute("DROP TYPE IF EXISTS user_status")
