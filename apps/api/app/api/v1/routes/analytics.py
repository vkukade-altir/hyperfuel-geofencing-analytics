"""Analytics read routes — spec Section 8.4."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.responses import success
from app.dependencies import get_analytics_service, get_entity_analytics_service
from app.schemas.internal.models import EntityRecord, PresenceSessionRecord
from app.schemas.responses.analytics_response import (
    DashboardSummaryData,
    UserSummaryItem,
    UserTimelineData,
)
from app.schemas.responses.entity_analytics_response import (
    EntityAnalyticsDetail,
    StationsCatalogData,
)
from app.schemas.responses.api_response import ApiResponse
from app.services.analytics_service import AnalyticsService
from app.services.entity_analytics_service import EntityAnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


@router.get(
    "/dashboard/summary",
    response_model=ApiResponse[DashboardSummaryData],
    summary="Aggregate KPIs for dashboard home",
)
async def dashboard_summary(
    from_dt: str | None = Query(None, alias="from"),
    to_dt: str | None = Query(None, alias="to"),
    analytics: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[DashboardSummaryData]:
    data = await analytics.get_dashboard_summary(
        from_dt=_parse_dt(from_dt),
        to_dt=_parse_dt(to_dt),
    )
    return success("Dashboard summary loaded", data)


@router.get(
    "/users",
    response_model=ApiResponse[list[UserSummaryItem]],
    summary="List all users with activity counts",
)
async def list_users(
    analytics: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[list[UserSummaryItem]]:
    data = await analytics.list_users()
    return success("Users loaded", data)


@router.get(
    "/users/{user_id}/timeline",
    response_model=ApiResponse[UserTimelineData],
    summary="Full user journey for debug and analysis",
)
async def user_timeline(
    user_id: str,
    from_dt: str | None = Query(None, alias="from"),
    to_dt: str | None = Query(None, alias="to"),
    limit: int = Query(500, ge=1, le=2000),
    analytics: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[UserTimelineData]:
    data = await analytics.get_user_timeline(
        user_id,
        from_dt=_parse_dt(from_dt),
        to_dt=_parse_dt(to_dt),
        limit=limit,
    )
    return success("User timeline loaded", data)


@router.get(
    "/entities",
    response_model=ApiResponse[list[EntityRecord]],
    summary="List entities for admin UI",
)
async def list_entities(
    user_id: str | None = Query(None),
    analytics: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[list[EntityRecord]]:
    data = await analytics.list_entities(user_id)
    return success("Entities loaded", data)


@router.get(
    "/presence-sessions",
    response_model=ApiResponse[list[PresenceSessionRecord]],
    summary="Dwell sessions with optional filters",
)
async def presence_sessions(
    user_id: str | None = Query(None),
    entity_id: str | None = Query(None),
    from_dt: str | None = Query(None, alias="from"),
    to_dt: str | None = Query(None, alias="to"),
    open_only: bool = Query(False),
    limit: int = Query(500, ge=1, le=2000),
    analytics: AnalyticsService = Depends(get_analytics_service),
) -> ApiResponse[list[PresenceSessionRecord]]:
    data = await analytics.list_sessions(
        user_id=user_id,
        entity_id=entity_id,
        from_dt=_parse_dt(from_dt),
        to_dt=_parse_dt(to_dt),
        open_only=open_only,
        limit=limit,
    )
    return success("Presence sessions loaded", data)


@router.get(
    "/stations/catalog",
    response_model=ApiResponse[StationsCatalogData],
    summary="Stations with nested amenities and visit stats",
)
async def stations_catalog(
    entity_analytics: EntityAnalyticsService = Depends(get_entity_analytics_service),
) -> ApiResponse[StationsCatalogData]:
    data = await entity_analytics.get_stations_catalog()
    return success("Stations catalog loaded", data)


@router.get(
    "/entities/{entity_id}/analytics",
    response_model=ApiResponse[EntityAnalyticsDetail],
    summary="Per-entity visit stats and user dwell breakdown",
)
async def entity_analytics(
    entity_id: str,
    entity_analytics: EntityAnalyticsService = Depends(get_entity_analytics_service),
) -> ApiResponse[EntityAnalyticsDetail]:
    data = await entity_analytics.get_entity_analytics(entity_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found")
    return success("Entity analytics loaded", data)
