from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class Drone(Base):
    __tablename__ = "drones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="idle")  # idle, active, returning, error, offline
    battery = Column(Float, default=100.0)  # Battery percentage (0-100)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with telemetry
    telemetry_records = relationship("Telemetry", back_populates="drone", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Drone(id={self.id}, name={self.name}, status={self.status}, battery={self.battery}%)>"