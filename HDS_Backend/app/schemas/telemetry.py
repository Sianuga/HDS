from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TelemetryBase(BaseModel):
    position_x: float = Field(..., description="X coordinate")
    position_y: float = Field(..., description="Y coordinate")
    position_z: Optional[float] = Field(default=0.0, description="Z coordinate (altitude)")
    velocity: Optional[float] = Field(default=0.0, ge=0, description="Current velocity")
    heading: Optional[float] = Field(default=0.0, ge=0, le=360, description="Direction in degrees")
    battery: float = Field(..., ge=0, le=100, description="Battery percentage")
    signal_strength: Optional[float] = Field(default=100.0, ge=0, le=100, description="Signal strength")
    status: str = Field(..., description="Current drone status")


class TelemetryCreate(TelemetryBase):
    """Schema for creating telemetry record"""
    drone_id: int = Field(..., description="ID of the drone")


class TelemetryResponse(TelemetryBase):
    """Schema for telemetry response"""
    id: int
    drone_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class TelemetryListResponse(BaseModel):
    """Schema for list of telemetry records"""
    total: int
    telemetry: list[TelemetryResponse]