from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings
from app.core.responses import success
from app.schemas.responses.api_response import ApiResponse
from app.schemas.responses.ingest_response import HealthDataResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse[HealthDataResponse], summary="Health check")
async def health() -> ApiResponse[HealthDataResponse]:
    settings = get_settings()
    data = HealthDataResponse(
        status="ok",
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc).isoformat(),
        storage_backend="memory" if settings.uses_memory_store else "supabase",
        supabase_configured=settings.supabase_configured,
    )
    return success("Service is healthy", data)
