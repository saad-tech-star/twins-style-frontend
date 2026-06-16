from sqlalchemy.pool import NullPool
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.extensions import db
from app.routes.admin import admin_bp
from app.routes.orders import orders_bp
from app.routes.products import products_bp
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

# ─── CONFIGURATION ────────────────────────────────────────────────────────────
app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY']                 = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "poolclass": NullPool,
    "connect_args": {"sslmode": "require"}
}

# ─── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "https://twins-style.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

CORS(app,
     resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin", "")
        response = make_response()
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"]      = origin
        response.headers["Access-Control-Allow-Headers"]         = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"]         = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"]     = "true"
        return response, 200

# ─── EXTENSIONS ───────────────────────────────────────────────────────────────
db.init_app(app)
jwt = JWTManager(app)

# ─── BLUEPRINTS ───────────────────────────────────────────────────────────────
app.register_blueprint(admin_bp,    url_prefix='/api/admin')
app.register_blueprint(orders_bp,   url_prefix='/api/orders')
app.register_blueprint(products_bp, url_prefix='/api/products')

# ─── CONNEXION DB ─────────────────────────────────────────────────────────────
def get_db_connection():
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        return psycopg2.connect(database_url)
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'aws-0-eu-west-1.pooler.supabase.com'),
        port=int(os.getenv('DB_PORT', '5432')),
        database=os.getenv('DB_NAME', 'postgres'),
        user=os.getenv('DB_USER', 'postgres.srckejwjqjzeqjloqsga'),
        password=os.getenv('DB_PASSWORD')
    )

# ─── ROUTE SANTÉ ──────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=False, port=5000, use_reloader=False)