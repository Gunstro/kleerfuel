from flask import Blueprint, jsonify, request, abort
from config import supabase
from models.schemas import TankCreate

tanks_bp = Blueprint("tanks", __name__, url_prefix="/api/tanks")

@tanks_bp.route("/<company_id>", methods=["GET"])
def list_tanks(company_id):
    if company_id == "summary":
        return jsonify({"error": "Wrong route structure"}), 400
    res = supabase.table("tanks").select("*, depots(name)").eq("company_id", company_id).eq("is_active", True).order("name").execute()
    return jsonify(res.data)

@tanks_bp.route("/detail/<tank_id>", methods=["GET"])
def get_tank(tank_id):
    res = supabase.table("tanks").select("*, depots(name)").eq("id", tank_id).maybe_single().execute()
    if not res.data:
        abort(404, description="Tank not found")
    return jsonify(res.data)

@tanks_bp.route("/", methods=["POST"])
def create_tank():
    tank = TankCreate(**request.json)
    res = supabase.table("tanks").insert(tank.model_dump(exclude_none=True)).execute()
    return jsonify(res.data[0])

@tanks_bp.route("/<tank_id>", methods=["PATCH"])
def update_tank(tank_id):
    updates = request.json
    res = supabase.table("tanks").update(updates).eq("id", tank_id).execute()
    if not res.data:
        abort(404, description="Tank not found")
    return jsonify(res.data[0])

@tanks_bp.route("/<tank_id>", methods=["DELETE"])
def deactivate_tank(tank_id):
    supabase.table("tanks").update({"is_active": False}).eq("id", tank_id).execute()
    return jsonify({"status": "deactivated"})

@tanks_bp.route("/<company_id>/summary", methods=["GET"])
def company_summary(company_id):
    tanks = supabase.table("tanks").select("*").eq("company_id", company_id).eq("is_active", True).execute().data
    anomalies = supabase.table("anomalies").select("id, severity").eq("company_id", company_id).eq("is_resolved", False).execute().data

    total_capacity = sum(float(t["capacity_liters"]) for t in tanks)
    total_level = sum(float(t["current_level_liters"]) for t in tanks)
    low_tanks = [t for t in tanks if (float(t["current_level_liters"]) / float(t["capacity_liters"]) * 100) <= float(t["alert_threshold_percent"])]

    return jsonify({
        "total_tanks": len(tanks),
        "total_capacity_liters": round(total_capacity, 2),
        "total_level_liters": round(total_level, 2),
        "overall_percent": round((total_level / total_capacity * 100) if total_capacity > 0 else 0, 1),
        "low_level_tanks": len(low_tanks),
        "active_anomalies": len(anomalies),
        "critical_anomalies": len([a for a in anomalies if a["severity"] == "critical"]),
    })
