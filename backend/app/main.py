from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routes.geolocation import router as geo_router
from app.routes.phone import router as phone_router
from app.routes.username import router as username_router
from app.routes.domain import router as domain_router
from app.routes.history import router as history_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="BLACK EYE API",
    description="Security Testing & Network Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(geo_router,      prefix="/api", tags=["Geolocation"])
app.include_router(phone_router,    prefix="/api", tags=["Phone"])
app.include_router(username_router, prefix="/api", tags=["Username"])
app.include_router(domain_router,   prefix="/api", tags=["Domain"])
app.include_router(history_router,  prefix="/api", tags=["History"])

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "BLACK EYE API", "version": "1.0.0"}

@app.get("/api/v1/health")
async def health_v1():
    return {"status": "ok", "service": "BLACK EYE API", "version": "1.0.0"}
