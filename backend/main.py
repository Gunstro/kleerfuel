from flask import Flask, jsonify
from flask_cors import CORS
from config import CORS_ORIGINS

from api.routes.iot import iot_bp
from api.routes.tanks import tanks_bp
from api.routes.anomalies import anomalies_bp

app = Flask(__name__)
# Configure CORS
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}}, supports_credentials=True)

app.register_blueprint(iot_bp)
app.register_blueprint(tanks_bp)
app.register_blueprint(anomalies_bp)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "kleerFUEL API", "version": "1.0.0"})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "kleerFUEL API — Total Fuel Visibility. Zero Shrinkage."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
