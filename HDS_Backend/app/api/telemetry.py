from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models import Telemetry, Drone
from app.schemas import TelemetryCreate, TelemetryResponse, TelemetryListResponse

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.post("/", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def create_telemetry(telemetry: TelemetryCreate, db: Session = Depends(get_db)):
    """
    Create a new telemetry record
    """
    # Check if drone exists
    drone = db.query(Drone).filter(Drone.id == telemetry.drone_id).first()
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {telemetry.drone_id} not found"
        )

    # Update drone's battery and status based on telemetry
    drone.battery = telemetry.battery
    drone.status = telemetry.status

    db_telemetry = Telemetry(**telemetry.model_dump())
    db.add(db_telemetry)
    db.commit()
    db.refresh(db_telemetry)
    return db_telemetry


@router.get("/", response_model=TelemetryListResponse)
def get_telemetry(
        skip: int = 0,
        limit: int = 100,
        drone_id: Optional[int] = Query(None, description="Filter by drone ID"),
        db: Session = Depends(get_db)
):
    """
    Get list of telemetry records with optional filtering
    """
    query = db.query(Telemetry)

    if drone_id is not None:
        query = query.filter(Telemetry.drone_id == drone_id)

    total = query.count()
    telemetry = query.order_by(Telemetry.timestamp.desc()).offset(skip).limit(limit).all()

    return {"total": total, "telemetry": telemetry}


@router.get("/drone/{drone_id}", response_model=TelemetryListResponse)
def get_drone_telemetry(
        drone_id: int,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    """
    Get telemetry records for a specific drone
    """
    # Check if drone exists
    drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {drone_id} not found"
        )

    query = db.query(Telemetry).filter(Telemetry.drone_id == drone_id)
    total = query.count()
    telemetry = query.order_by(Telemetry.timestamp.desc()).offset(skip).limit(limit).all()

    return {"total": total, "telemetry": telemetry}


@router.get("/drone/{drone_id}/latest", response_model=TelemetryResponse)
def get_latest_telemetry(drone_id: int, db: Session = Depends(get_db)):
    """
    Get the latest telemetry record for a specific drone
    """
    # Check if drone exists
    drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {drone_id} not found"
        )

    telemetry = db.query(Telemetry).filter(
        Telemetry.drone_id == drone_id
    ).order_by(Telemetry.timestamp.desc()).first()

    if not telemetry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry data found for drone {drone_id}"
        )

    return telemetry


@router.delete("/{telemetry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_telemetry(telemetry_id: int, db: Session = Depends(get_db)):
    """
    Delete a telemetry record
    """
    db_telemetry = db.query(Telemetry).filter(Telemetry.id == telemetry_id).first()
    if not db_telemetry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Telemetry record with id {telemetry_id} not found"
        )

    db.delete(db_telemetry)
    db.commit()
    return None