from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    drone_id = Column(Integer, ForeignKey("drones.id"), nullable=False)

    # Position data
    position_x = Column(Float, nullable=False)
    position_y = Column(Float, nullable=False)
    position_z = Column(Float, default=0.0)  # Altitude

    # Movement data
    velocity = Column(Float, default=0.0)
    heading = Column(Float, default=0.0)  # Direction in degrees (0-360)

    # Technical data
    battery = Column(Float, nullable=False)
    signal_strength = Column(Float, default=100.0)  # Signal strength percentage

    # Status
    status = Column(String, nullable=False)

    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship with drone
    drone = relationship("Drone", back_populates="telemetry_records")

    def __repr__(self):
        return f"<Telemetry(drone_id={self.drone_id}, pos=({self.position_x}, {self.position_y}), time={self.timestamp})>"