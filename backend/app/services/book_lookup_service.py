"""
Book Lookup Service – Fetches metadata from Open Library and Google Books.
This service is stateless and has no DB dependency.
"""
import logging
from typing import Any

import httpx

from app.core.config import get_settings
from app.schemas.schemas import ISBNLookupResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class BookLookupService:
    """
    Tries Open Library first (free, no key required).
    Falls back to Google Books if configured.
    """

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=10.0)

    async def lookup_by_isbn(self, isbn: str) -> ISBNLookupResponse | None:
        result = await self._try_open_library(isbn)
        if result:
            return result

        if settings.GOOGLE_BOOKS_API_KEY:
            result = await self._try_google_books(isbn)

        return result

    # ── Open Library ─────────────────────────────────────────

    async def _try_open_library(self, isbn: str) -> ISBNLookupResponse | None:
        url = f"{settings.OPEN_LIBRARY_API_URL}/api/books"
        params = {
            "bibkeys": f"ISBN:{isbn}",
            "format": "json",
            "jscmd": "data",
        }
        try:
            resp = await self._client.get(url, params=params)
            resp.raise_for_status()
            data: dict[str, Any] = resp.json()

            key = f"ISBN:{isbn}"
            if key not in data:
                return None

            book = data[key]
            authors = [a["name"] for a in book.get("authors", [])]
            subjects = [s["name"] for s in book.get("subjects", [])]
            publishers = [p["name"] for p in book.get("publishers", [])]

            cover_url: str | None = None
            covers = book.get("cover", {})
            cover_url = covers.get("large") or covers.get("medium") or covers.get("small")

            genre = subjects[0] if subjects else None

            return ISBNLookupResponse(
                isbn=isbn,
                title=book.get("title"),
                author=", ".join(authors) if authors else None,
                description=book.get("notes"),
                cover_image_url=cover_url,
                genre=genre,
                category=None,
                language=book.get("language", {}).get("key", "").replace("/languages/", ""),
                publisher=publishers[0] if publishers else None,
                published_date=book.get("publish_date"),
                page_count=book.get("number_of_pages"),
            )
        except Exception as exc:
            logger.warning("Open Library lookup failed for ISBN %s: %s", isbn, exc)
            return None

    # ── Google Books ──────────────────────────────────────────

    async def _try_google_books(self, isbn: str) -> ISBNLookupResponse | None:
        url = f"{settings.GOOGLE_BOOKS_API_URL}/volumes"
        params: dict[str, str] = {
            "q": f"isbn:{isbn}",
            "key": settings.GOOGLE_BOOKS_API_KEY,
        }
        try:
            resp = await self._client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

            if not data.get("items"):
                return None

            info: dict[str, Any] = data["items"][0].get("volumeInfo", {})
            authors = info.get("authors", [])
            image_links = info.get("imageLinks", {})
            categories = info.get("categories", [])

            return ISBNLookupResponse(
                isbn=isbn,
                title=info.get("title"),
                author=", ".join(authors) if authors else None,
                description=info.get("description"),
                cover_image_url=(
                    image_links.get("thumbnail") or image_links.get("smallThumbnail")
                ),
                genre=categories[0] if categories else None,
                category=categories[1] if len(categories) > 1 else None,
                language=info.get("language"),
                publisher=info.get("publisher"),
                published_date=info.get("publishedDate"),
                page_count=info.get("pageCount"),
            )
        except Exception as exc:
            logger.warning("Google Books lookup failed for ISBN %s: %s", isbn, exc)
            return None

    async def aclose(self) -> None:
        await self._client.aclose()
