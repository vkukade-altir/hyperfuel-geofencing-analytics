from fastapi import APIRouter, Depends, Query

from app.core.responses import success
from app.dependencies import get_entity_service
from app.schemas.internal.models import GeofenceConfigItem
from app.schemas.responses.api_response import ApiResponse
from app.services.entity_service import EntityService

router = APIRouter(prefix="/geofence-config", tags=["geofence-config"])


@router.get("", response_model=ApiResponse[list[GeofenceConfigItem]], summary="List station geofences")
async def geofence_config(
    user_id: str = Query(..., min_length=1, max_length=128),
    entity_service: EntityService = Depends(get_entity_service),
) -> ApiResponse[list[GeofenceConfigItem]]:
    config = await entity_service.get_geofence_config(user_id.strip())
    return success("Geofence config loaded", config)
