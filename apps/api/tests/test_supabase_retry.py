"""Tests for transient Supabase/httpx retry behavior."""

import pytest
import httpx

from app.core.exceptions import StorageUnavailableError
from app.core.supabase_retry import with_supabase_retry


@pytest.mark.asyncio
async def test_with_supabase_retry_succeeds_on_second_attempt() -> None:
    attempts = 0

    async def flaky() -> str:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise httpx.ReadError("connection reset")
        return "ok"

    result = await with_supabase_retry(flaky, operation="test")
    assert result == "ok"
    assert attempts == 2


@pytest.mark.asyncio
async def test_with_supabase_retry_raises_storage_unavailable_after_exhausted() -> None:
    async def always_fails() -> str:
        raise httpx.ConnectError("[Errno 8] nodename nor servname provided, or not known")

    with pytest.raises(StorageUnavailableError) as exc_info:
        await with_supabase_retry(always_fails, operation="test")

    assert exc_info.value.status_code == 503
    assert exc_info.value.code == "STORAGE_UNAVAILABLE"
