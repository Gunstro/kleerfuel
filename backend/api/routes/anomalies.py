from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, abort
from config import supabase
from models.schemas import AnomalyResolve

anomalies_bp = Blueprint("anomalies", __name__, url_prefix="/api/anomalies")

@anomalies_bp.route("/<company_id>", methods=["GET"])
def list_anomalies(company_id):
    resolved = request.args.get('resolved', 'false').lower() == 'true'
    limit = int(request.args.get('limit', 50))
    res = supabase.table("anomalies").select("*, tanks(name, fuel_type)").eq("company_id", company_id).eq("is_resolved", resolved).order("detected_at", desc=True).limit(limit).execute()
    return jsonify(res.data)

@anomalies_bp.route("/resolve", methods=["POST"])
def resolve_anomaly():
    payload = AnomalyResolve(**request.json)
    res = supabase.table("anomalies").update({
        "is_resolved": True,
        "resolution_notes": payload.resolution_notes,
        "resolved_by": payload.resolved_by,
        "resolved_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", payload.anomaly_id).execute()
    if not res.data:
        abort(404, description="Anomaly not found")
    return jsonify({"status": "resolved", "anomaly_id": payload.anomaly_id})

@anomalies_bp.route("/run-reconciliation/<company_id>", methods=["POST"])
def run_reconciliation(company_id):
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    tanks = supabase.table("tanks").select("*").eq("company_id", company_id).eq("is_active", True).execute().data
    results = []

    for tank in tanks:
        tank_id = tank["id"]
        readings = supabase.table("tank_readings").select("level_liters, recorded_at").eq("tank_id", tank_id).gte("recorded_at", cutoff).order("recorded_at").execute().data
        if len(readings) < 2:
            continue
        iot_delta = float(readings[0]["level_liters"]) - float(readings[-1]["level_liters"])
        txns = supabase.table("transactions").select("liters_dispensed").eq("tank_id", tank_id).gte("transaction_at", cutoff).execute().data
        transaction_total = sum(float(t["liters_dispensed"]) for t in txns)

        variance = iot_delta - transaction_total
        status = "ok"

        if variance > 100:
            status = "discrepancy"
            from api.routes.iot import _create_anomaly
            _create_anomaly(
                company_id, tank_id,
                "theft" if variance > 300 else "leak",
                "critical" if variance > 500 else "high",
                f"24h reconciliation: IoT drop {iot_delta:.0f}L, transactions {transaction_total:.0f}L — unaccounted {variance:.0f}L.",
                volume_loss=variance,
                cost_impact=variance * float(tank.get("cost_per_liter") or 22.5)
            )

        results.append({
            "tank_id": tank_id,
            "tank_name": tank["name"],
            "iot_delta_liters": round(iot_delta, 2),
            "transaction_total_liters": round(transaction_total, 2),
            "variance_liters": round(variance, 2),
            "status": status,
        })

    return jsonify({"company_id": company_id, "reconciliation_results": results, "ran_at": datetime.now(timezone.utc).isoformat()})
