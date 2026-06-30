"""Open/close presence_sessions inline during ping processing — Section 6.6."""

from datetime import datetime

from app.repositories.memory_backend import MemoryBackend


class SessionService:
    def __init__(self, backend: MemoryBackend) -> None:
        self._backend = backend

    async def open_session(
        self,
        *,
        user_id: str,
        entity_type: str,
        entity_id: str,
        station_id: str | None,
        entered_at: datetime,
        enter_event_id: str,
    ) -> None:
        """Section 6.6: one open session per (user, entity_type, entity_id)."""
        await self._backend.open_session(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            station_id=station_id,
            entered_at=entered_at,
            enter_event_id=enter_event_id,
        )

    async def close_session(
        self,
        *,
        user_id: str,
        entity_type: str,
        entity_id: str,
        exited_at: datetime,
        exit_event_id: str,
    ) -> None:
        await self._backend.close_session(
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            exited_at=exited_at,
            exit_event_id=exit_event_id,
        )
