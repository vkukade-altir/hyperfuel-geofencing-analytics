"""Tests for Supabase idempotency on unique-constraint conflicts."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from postgrest.exceptions import APIError

from app.repositories.supabase_backend import SupabaseBackend


@pytest.mark.asyncio
async def test_insert_ping_treats_unique_violation_as_duplicate() -> None:
    backend = SupabaseBackend(client=MagicMock())
    empty_check = MagicMock(data=None)
    backend._run = AsyncMock(side_effect=[empty_check, APIError({"code": "23505", "message": "duplicate"})])

    result = await backend.insert_ping(
        user_id="user-1",
        device_id=None,
        client_ping_id="ping-dup",
        recorded_at=datetime(2026, 6, 24, 10, 0, tzinfo=timezone.utc),
        latitude=1.0,
        longitude=2.0,
        accuracy_meters=None,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=None,
        ping_reason=None,
        context=None,
    )

    assert result is None
    assert backend._run.await_count == 2
