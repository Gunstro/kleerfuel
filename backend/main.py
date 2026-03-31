from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
from api.routes import iot, tanks, anomalies

app = FastAPI(
    title="kleerFUEL API",
    description="Total Fuel Visibility. Zero Shrinkage.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(iot.router)
app.include_router(tanks.router)
app.include_router(anomalies.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "kleerFUEL API", "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": "kleerFUEL API — Total Fuel Visibility. Zero Shrinkage."}
