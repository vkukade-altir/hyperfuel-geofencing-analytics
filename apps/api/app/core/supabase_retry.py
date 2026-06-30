"""Retry transient Supabase/httpx failures — avoids 500s on brief network blips."""

import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import TypeVar

import httpx

from app.core.exceptions import StorageUnavailableError

logger = logging.getLogger(__name__)

T = TypeVar("T")

# Transient errors seen against Supabase PostgREST (DNS blip, HTTP/2 read reset, etc.)
_TRANSIENT = (
    httpx.ConnectError,
    httpx.ReadError,
    httpx.WriteError,
    httpx.RemoteProtocolError,
    httpx.TimeoutException,
    httpx.PoolTimeout,
)

_MAX_ATTEMPTS = 3
_BASE_DELAY_S = 0.35


async def with_supabase_retry(
    fn: Callable[[], Awaitable[T]],
    *,
    operation: str = "supabase",
) -> T:
    """Run an async Supabase call; retry on transient httpx errors."""
    last_exc: Exception | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            return await fn()
        except _TRANSIENT as exc:
            last_exc = exc
            if attempt >= _MAX_ATTEMPTS:
                break
            delay = _BASE_DELAY_S * (2 ** (attempt - 1))
            logger.warning(
                "%s transient failure (attempt %s/%s): %s — retrying in %.2fs",
                operation,
                attempt,
                _MAX_ATTEMPTS,
                exc,
                delay,
            )
            await asyncio.sleep(delay)
    assert last_exc is not None
    logger.error("%s failed after %s attempts: %s", operation, _MAX_ATTEMPTS, last_exc)
    raise StorageUnavailableError(
        "Cannot reach the database right now. Check your network and Supabase URL, then try again.",
        details=str(last_exc),
    ) from last_exc
