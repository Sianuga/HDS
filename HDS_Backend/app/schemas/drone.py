from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class DroneBase(BaseModel):
    name: str = Field(..., description="Unique name of the drone")
    status: Optional[str] = Field(default="idle", description="Current status of the drone")
    battery: Optional[float] = Field(default=100.0, ge=0, le=100, description="Battery percentage")


class DroneCreate(DroneBase):
    """Schema for creating a new drone"""
    pass


class DroneUpdate(BaseModel):
    """Schema for updating drone information"""
    name: Optional[str] = None
    status: Optional[str] = None
    battery: Optional[float] = Field(None, ge=0, le=100)


class DroneResponse(DroneBase):
    """Schema for drone response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DroneListResponse(BaseModel):
    """Schema for list of drones"""
    total: int
    drones: list[DroneResponse]