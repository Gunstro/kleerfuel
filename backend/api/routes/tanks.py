"""
Tanks CRUD API
"""
from fastapi import APIRouter, HTTPException
from config import supabase
from models.schemas import TankCreate

router = APIRouter(prefix="/api/tanks", tags=["Tanks"])


@router.get("/{company_id}")
async def list_tanks(company_id: str):
    res = supabase.table("tanks").select(
        "*, depots(name)"
    ).eq("company_id", company_id).eq("is_active", True).order("name").execute()
    return res.data


@router.get("/detail/{tank_id}")
async def get_tank(tank_id: str):
    res = supabase.table("tanks").select("*, depots(name)").eq("id", tank_id).maybe_single().execute()
    if not res.data:
        raise HTTPException(404, "Tank not found")
    return res.data


@router.post("/")
async def create_tank(tank: TankCreate):
    res = supabase.table("tanks").insert(tank.model_dump(exclude_none=True)).execute()
    return res.data[0]


@router.patch("/{tank_id}")
async def update_tank(tank_id: str, updates: dict):
    res = supabase.table("tanks").update(updates).eq("id", tank_id).execute()
    if not res.data:
        raise HTTPException(404, "Tank not found")
    return res.data[0]


@router.delete("/{tank_id}")
async def deactivate_tank(tank_id: str):
    supabase.table("tanks").update({"is_active": False}).eq("id", tank_id).execute()
    return {"status": "deactivated"}


@router.get("/{company_id}/summary")
async def company_summary(company_id: str):
    """Dashboard summary: totals + risk levels."""
    tanks = supabase.table("tanks").select("*").eq("company_id", company_id).eq("is_active", True).execute().data
    anomalies = supabase.table("anomalies").select("id, severity").eq("company_id", company_id).eq("is_resolved", False).execute().data

    total_capacity = sum(float(t["capacity_liters"]) for t in tanks)
    total_level = sum(float(t["current_level_liters"]) for t in tanks)
    low_tanks = [t for t in tanks if (float(t["current_level_liters"]) / float(t["capacity_liters"]) * 100) <= float(t["alert_threshold_percent"])]

    return {
        "total_tanks": len(tanks),
        "total_capacity_liters": round(total_capacity, 2),
        "total_level_liters": round(total_level, 2),
        "overall_percent": round((total_level / total_capacity * 100) if total_capacity > 0 else 0, 1),
        "low_level_tanks": len(low_tanks),
        "active_anomalies": len(anomalies),
        "critical_anomalies": len([a for a in anomalies if a["severity"] == "critical"]),
    }
