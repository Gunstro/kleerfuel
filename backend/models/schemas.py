from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IoTReading(BaseModel):
    device_id: str
    level_liters: float
    level_percent: Optional[float] = None
    temperature_celsius: Optional[float] = None
    water_detected: bool = False
    sensor_status: str = "ok"
    source: str = "iot"
    raw_payload: Optional[dict] = None


class SimulateRequest(BaseModel):
    company_id: str
    interval_minutes: int = 15
    anomaly_chance: float = 0.05   # 5% chance of generating anomaly


class TankCreate(BaseModel):
    company_id: str
    depot_id: Optional[str] = None
    name: str
    fuel_type: str = "diesel"
    capacity_liters: float
    current_level_liters: float = 0
    alert_threshold_percent: float = 20.0
    cost_per_liter: Optional[float] = None
    iot_device_id: Optional[str] = None
    iot_protocol: Optional[str] = None
    notes: Optional[str] = None


class AnomalyResolve(BaseModel):
    anomaly_id: str
    resolution_notes: str
    resolved_by: str
