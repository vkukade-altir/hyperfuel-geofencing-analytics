import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.analytics import router as analytics_router
from app.api.v1.routes.geofence_config import router as geofence_config_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.ingest import router as ingest_router
from app.config import get_settings
from app.core.error_handlers import register_exception_handlers
from app.core.supabase import get_admin_client
from app.repositories.memory_backend import MemoryBackend
from app.repositories.supabase_backend import SupabaseBackend

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if settings.uses_memory_store:
        app.state.backend = MemoryBackend()
        logger.info("Using in-memory store (USE_MEMORY_STORE or missing Supabase credentials)")
    else:
        client = await get_admin_client(settings)
        app.state.backend = SupabaseBackend(client)
        logger.info("Using Supabase backend")
    yield


app = FastAPI(title="Hyperfuel Geofencing Analytics API", version="1.0.0", lifespan=lifespan)
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(ingest_router, prefix="/api/v1")
app.include_router(geofence_config_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
