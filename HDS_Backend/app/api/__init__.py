from .drones import router as drones_router
from .telemetry import router as telemetry_router

__all__ = ["drones_router", "telemetry_router"]