from typing import Any

from httpx import AsyncClient, Timeout
from supabase import AsyncClient as SupabaseAsyncClient, acreate_client
from supabase.lib.client_options import AsyncClientOptions

from app.config import Settings

# HTTP/2 read resets are a common flake against Supabase; HTTP/1.1 is more stable for dev.
_HTTP_TIMEOUT = Timeout(connect=10.0, read=30.0, write=30.0, pool=10.0)


async def get_admin_client(settings: Settings) -> SupabaseAsyncClient:
    httpx_client = AsyncClient(timeout=_HTTP_TIMEOUT, http2=False)
    options = AsyncClientOptions(httpx_client=httpx_client)
    return await acreate_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
        options=options,
    )


def first_row_or_none(response: Any) -> dict[str, Any] | None:
    if response is None:
        return None
    data = response.data
    if data is None:
        return None
    if isinstance(data, list):
        if not data:
            return None
        row = data[0]
        return row if isinstance(row, dict) else None
    if isinstance(data, dict):
        return data
    return None
