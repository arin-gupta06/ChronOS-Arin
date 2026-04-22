from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import activity, reports, focus

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Focus Tracker API",
    description="Track your browsing behavior and calculate your Focus Score",
    version="1.0.0",
)

# CORS - allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(activity.router)
app.include_router(reports.router)
app.include_router(focus.router)


@app.get("/")
def root():
    return {
        "message": "Focus Tracker API is running!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
