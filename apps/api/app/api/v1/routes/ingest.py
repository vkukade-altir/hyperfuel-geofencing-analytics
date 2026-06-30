from fastapi import APIRouter, Depends

from app.core.responses import success
from app.dependencies import get_entity_service, get_ingest_service
from app.schemas.requests.ingest_request import IngestRequest
from app.schemas.responses.api_response import ApiResponse
from app.schemas.responses.ingest_response import IngestDataResponse
from app.services.entity_service import EntityService
from app.services.ingest_service import IngestService

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("", response_model=ApiResponse[IngestDataResponse], summary="Ingest entities, pings, events")
async def ingest(
    payload: IngestRequest,
    ingest_service: IngestService = Depends(get_ingest_service),
) -> ApiResponse[IngestDataResponse]:
    data = await ingest_service.process(payload)
    return success("Ingest processed successfully", data)
