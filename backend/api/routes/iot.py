import random
import logging
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, abort
from config import supabase
from models.schemas import IoTReading, SimulateRequest
import threading

logger = logging.getLogger(__name__)
iot_bp = Blueprint("iot", __name__, url_prefix="/api/iot")

@iot_bp.route("/ingest", methods=["POST"])
def ingest_reading():
    reading = IoTReading(**request.json)
    tank_res = supabase.table("tanks").select("id, company_id, capacity_liters, alert_threshold_percent, name").eq("iot_device_id", reading.device_id).eq("is_active", True).maybe_single().execute()

    if not tank_res.data:
        abort(404, description=f"No active tank found for device_id: {reading.device_id}")

    tank = tank_res.data
    percent = reading.level_percent
    if percent is None and tank["capacity_liters"] > 0:
        percent = round((reading.level_liters / tank["capacity_liters"]) * 100, 2)

    new_reading = {
        "tank_id": tank["id"],
        "company_id": tank["company_id"],
        "level_liters": reading.level_liters,
        "level_percent": percent,
        "temperature_celsius": reading.temperature_celsius,
        "water_detected": reading.water_detected,
        "sensor_status": reading.sensor_status,
        "source": reading.source,
        "raw_payload": reading.raw_payload,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    }
    supabase.table("tank_readings").insert(new_reading).execute()

    supabase.table("tanks").update({
        "current_level_liters": reading.level_liters,
        "last_reading_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", tank["id"]).execute()

    if percent is not None and percent <= tank["alert_threshold_percent"]:
        _create_anomaly(tank["company_id"], tank["id"], "low_level", "medium",
                        f"Tank '{tank['name']}' at {percent:.1f}% — below threshold of {tank['alert_threshold_percent']}%.")

    return jsonify({"status": "ok", "tank_id": tank["id"], "level_liters": reading.level_liters, "level_percent": percent})

@iot_bp.route("/simulate/<company_id>", methods=["POST"])
def simulate_readings(company_id):
    req_data = request.json if request.is_json else None
    req = SimulateRequest(**req_data) if req_data else None
    chance = req.anomaly_chance if req else 0.05
    # Start simulation in background thread in Flask
    thread = threading.Thread(target=_run_simulation, args=(company_id, chance))
    thread.daemon = True
    thread.start()
    return jsonify({"status": "simulation_started", "company_id": company_id})

@iot_bp.route("/readings/<tank_id>", methods=["GET"])
def get_readings(tank_id):
    limit = int(request.args.get('limit', 48))
    res = supabase.table("tank_readings").select("*").eq("tank_id", tank_id).order("recorded_at", desc=True).limit(limit).execute()
    return jsonify({"tank_id": tank_id, "readings": list(reversed(res.data))})

@iot_bp.route("/latest/<tank_id>", methods=["GET"])
def get_latest(tank_id):
    res = supabase.table("tank_readings").select("*").eq("tank_id", tank_id).order("recorded_at", desc=True).limit(1).maybe_single().execute()
    if not res.data:
        abort(404, description="No readings found")
    return jsonify(res.data)

def _run_simulation(company_id: str, anomaly_chance: float = 0.05):
    tanks_res = supabase.table("tanks").select("*").eq("company_id", company_id).eq("is_active", True).execute()
    if not tanks_res.data:
        return

    hour = datetime.now().hour
    is_quiet_hours = hour >= 22 or hour <= 5

    for tank in tanks_res.data:
        capacity = float(tank["capacity_liters"])
        current = float(tank["current_level_liters"])
        threshold_pct = float(tank["alert_threshold_percent"])

        if is_quiet_hours:
            consumption_pct = random.uniform(0.001, 0.003)
        else:
            consumption_pct = random.uniform(0.003, 0.015)

        consumption = capacity * consumption_pct
        new_level = max(0.0, current - consumption + random.uniform(-50, 20))
        new_level = min(new_level, capacity)
        new_percent = round((new_level / capacity) * 100, 2)

        anomaly_triggered = False
        if is_quiet_hours and random.random() < anomaly_chance:
            theft_amount = random.uniform(200, 800)
            new_level = max(0.0, new_level - theft_amount)
            new_percent = round((new_level / capacity) * 100, 2)
            anomaly_triggered = True
            _create_anomaly(
                company_id, tank["id"], "unauthorized_drop", "critical",
                f"Tank '{tank['name']}': {theft_amount:.0f}L drop detected during quiet hours ({hour:02d}:00). No authorised transaction.",
                volume_loss=theft_amount,
                cost_impact=theft_amount * float(tank.get("cost_per_liter") or 22.5)
            )

        supabase.table("tank_readings").insert({
            "tank_id": tank["id"],
            "company_id": company_id,
            "level_liters": round(new_level, 2),
            "level_percent": new_percent,
            "temperature_celsius": round(random.uniform(18.0, 35.0), 1),
            "source": "simulated",
            "sensor_status": "ok",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        supabase.table("tanks").update({
            "current_level_liters": round(new_level, 2),
            "last_reading_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", tank["id"]).execute()

        if new_percent <= threshold_pct and not anomaly_triggered:
            _create_anomaly(company_id, tank["id"], "low_level", "medium",
                            f"Tank '{tank['name']}' at {new_percent:.1f}% — at or below alert threshold.")

def _create_anomaly(company_id, tank_id, atype, severity, description, volume_loss=None, cost_impact=None):
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
    existing = supabase.table("anomalies").select("id").eq("tank_id", tank_id).eq("type", atype).eq("is_resolved", False).gte("detected_at", cutoff).maybe_single().execute()
    if existing.data:
        return

    payload = {
        "company_id": company_id,
        "tank_id": tank_id,
        "type": atype,
        "severity": severity,
        "description": description,
        "auto_detected": True,
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }
    if volume_loss is not None:
        payload["volume_loss_liters"] = round(volume_loss, 2)
    if cost_impact is not None:
        payload["cost_impact"] = round(cost_impact, 2)

    supabase.table("anomalies").insert(payload).execute()
