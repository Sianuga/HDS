from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Drone
from app.schemas import DroneCreate, DroneUpdate, DroneResponse, DroneListResponse

router = APIRouter(prefix="/drones", tags=["Drones"])


@router.post("/", response_model=DroneResponse, status_code=status.HTTP_201_CREATED)
def create_drone(drone: DroneCreate, db: Session = Depends(get_db)):
    """
    Create a new drone
    """
    # Check if drone with this name already exists
    existing_drone = db.query(Drone).filter(Drone.name == drone.name).first()
    if existing_drone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Drone with name '{drone.name}' already exists"
        )

    db_drone = Drone(**drone.model_dump())
    db.add(db_drone)
    db.commit()
    db.refresh(db_drone)
    return db_drone


@router.get("/", response_model=DroneListResponse)
def get_drones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get list of all drones
    """
    total = db.query(Drone).count()
    drones = db.query(Drone).offset(skip).limit(limit).all()
    return {"total": total, "drones": drones}


@router.get("/{drone_id}", response_model=DroneResponse)
def get_drone(drone_id: int, db: Session = Depends(get_db)):
    """
    Get specific drone by ID
    """
    drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {drone_id} not found"
        )
    return drone


@router.put("/{drone_id}", response_model=DroneResponse)
def update_drone(drone_id: int, drone_update: DroneUpdate, db: Session = Depends(get_db)):
    """
    Update drone information
    """
    db_drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not db_drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {drone_id} not found"
        )

    # Update only provided fields
    update_data = drone_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_drone, field, value)

    db.commit()
    db.refresh(db_drone)
    return db_drone


@router.delete("/{drone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drone(drone_id: int, db: Session = Depends(get_db)):
    """
    Delete a drone
    """
    db_drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not db_drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Drone with id {drone_id} not found"
        )

    db.delete(db_drone)
    db.commit()
    return None