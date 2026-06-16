# app/routes/admin.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime
from app.extensions import db
from app.models.admin_user import AdminUser
from app.models.order import Order

admin_bp = Blueprint('admin', __name__)


# ─── LOGIN ────────────────────────────────────────────────────────────────────

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email et mot de passe requis'}), 400

    admin = AdminUser.query.filter_by(email=data['email']).first()

    if not admin or not admin.is_active or not admin.check_password(data['password']):
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    admin.last_login = datetime.utcnow()
    db.session.commit()

    token = create_access_token(identity=str(admin.id))
    return jsonify({
        'token': token,
        'admin': admin.to_dict()
    }), 200


# ─── COMMANDES ────────────────────────────────────────────────────────────────

@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    statut = request.args.get('statut')  # ?statut=en attente
    query = Order.query.order_by(Order.created_at.desc())
    if statut:
        query = query.filter_by(statut=statut)
    orders = query.all()
    return jsonify([o.to_dict() for o in orders]), 200


@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200


@admin_bp.route('/orders/<int:order_id>/statut', methods=['PATCH'])
@jwt_required()
def update_statut(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    nouveaux_statuts = ['en attente', 'confirmé', 'livré']

    if not data or data.get('statut') not in nouveaux_statuts:
        return jsonify({'error': f'Statut invalide. Valeurs acceptées : {nouveaux_statuts}'}), 400

    order.statut = data['statut']
    db.session.commit()
    return jsonify(order.to_dict()), 200


# ─── STATS ────────────────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total     = Order.query.count()
    en_attente = Order.query.filter_by(statut='en attente').count()
    confirme  = Order.query.filter_by(statut='confirmé').count()
    livre     = Order.query.filter_by(statut='livré').count()
    revenu    = db.session.query(db.func.sum(Order.prix)).filter_by(statut='livré').scalar() or 0

    return jsonify({
        'total':      total,
        'en_attente': en_attente,
        'confirme':   confirme,
        'livre':      livre,
        'revenu':     round(revenu, 2)
    }), 200