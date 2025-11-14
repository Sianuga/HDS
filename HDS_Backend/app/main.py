from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api import drones_router, telemetry_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HDS Backend API",
    description="Backend API for Drone Swarm Control System (HDS)",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(drones_router)
app.include_router(telemetry_router)


@app.get("/")
def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "HDS Backend API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}