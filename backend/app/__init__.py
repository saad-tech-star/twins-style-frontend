# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
import os

from .extensions import db, migrate, jwt, limiter
from .config import config


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": os.environ.get('CORS_ORIGINS', 'http://localhost:5173')
        }
    })

    # Créer dossier uploads si inexistant
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)

    # Enregistrer les blueprints
    from .routes.admin import admin_bp
    from .routes.products import products_bp
    from .routes.orders import orders_bp
    from .routes.auth import auth_bp

    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Servir les images statiques
    from flask import send_from_directory

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app