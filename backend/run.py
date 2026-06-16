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
app.config['SQLALCHEMY_DATABASE_URI']    = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY']             = os.getenv('JWT_SECRET_KEY')

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS(app,
    resources={
        r"/api/*": {"origins": "http://localhost:5173"},
        r"/products*": {"origins": "http://localhost:5173"}
    },
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers["Access-Control-Allow-Origin"]      = "http://localhost:5173"
        response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

# ─── EXTENSIONS ───────────────────────────────────────────────────────────────
db.init_app(app)
jwt = JWTManager(app)

# ─── BLUEPRINTS ───────────────────────────────────────────────────────────────
app.register_blueprint(admin_bp,  url_prefix='/api/admin')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(products_bp, url_prefix='/products')

# ─── ROUTES PRODUITS ──────────────────────────────────────────────────────────
def get_db_connection():
    return psycopg2.connect(
        host="aws-0-eu-west-1.pooler.supabase.com",
        port=5432,
        database="postgres",
        user="postgres.srckejwjqjzeqjloqsga",
        password=os.getenv('fashiontamaris2026')
    )

@app.route('/api/produits', methods=['GET'])
def get_produits():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM produits;')
    produits = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(produits)

@app.route('/api/produits/<int:id>', methods=['GET'])
def get_produit_by_id(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM produits WHERE id = %s;', (id,))
    produit = cur.fetchone()
    cur.close()
    conn.close()
    if produit:
        return jsonify(produit)
    return jsonify({"error": "Produit non trouvé"}), 404

if __name__ == '__main__':
    app.run(debug=False, port=5000, use_reloader=False)

    