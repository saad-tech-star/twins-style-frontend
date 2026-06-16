from flask import Blueprint, request, jsonify
from datetime import datetime
from app.extensions import db, limiter
from app.models.order import Order
from app.utils.decorators import admin_required

orders_bp = Blueprint('orders', __name__)


# ─── PUBLIC : créer une commande ──────────────────────────────────────────────

@orders_bp.route('', methods=['POST'])
@limiter.limit("10 per hour")
def create_order():
    data = request.get_json()

    for field in ['client', 'phone', 'produit', 'prix']:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400

    order = Order(
        client  = data['client'],
        phone   = data['phone'],
        email   = data.get('email'),
        produit = data['produit'],
        taille  = data.get('taille'),
        couleur = data.get('couleur'),
        prix    = float(data['prix']),
        adresse = data.get('adresse'),
        statut  = 'en attente',
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({
        'message': 'Commande passée avec succès !',
        'order':   order.to_dict()
    }), 201


# ─── ADMIN : liste des commandes ──────────────────────────────────────────────

@orders_bp.route('/admin/all', methods=['GET'])
@admin_required
def admin_get_orders():
    page   = request.args.get('page', 1, type=int)
    statut = request.args.get('status')
    search = request.args.get('search', '')

    query = Order.query

    if statut:
        query = query.filter_by(statut=statut)

    if search:
        query = query.filter(
            (Order.client.ilike(f'%{search}%')) |
            (Order.phone.ilike(f'%{search}%'))
        )

    query      = query.order_by(Order.created_at.desc())
    pagination = query.paginate(page=page, per_page=20, error_out=False)

    return jsonify({
        'orders': [o.to_dict() for o in pagination.items],
        'total':  pagination.total,
        'pages':  pagination.pages
    }), 200


# ─── ADMIN : détail commande ──────────────────────────────────────────────────

@orders_bp.route('/admin/<int:order_id>', methods=['GET'])
@admin_required
def admin_get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200


# ─── ADMIN : changer statut ───────────────────────────────────────────────────

@orders_bp.route('/admin/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_status(order_id):
    order      = Order.query.get_or_404(order_id)
    data       = request.get_json()
    new_statut = data.get('status')

    valid = ['en attente', 'confirmé', 'livré']
    if new_statut not in valid:
        return jsonify({'error': f'Statut invalide. Choix: {valid}'}), 400

    order.statut     = new_statut
    order.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Statut mis à jour', 'order': order.to_dict()}), 200


# ─── ADMIN : stats ────────────────────────────────────────────────────────────

@orders_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_stats():
    from sqlalchemy import func

    total_revenue = db.session.query(
        func.sum(Order.prix)
    ).filter(Order.statut == 'livré').scalar() or 0

    return jsonify({
        'total_orders': Order.query.count(),
        'pending':      Order.query.filter_by(statut='en attente').count(),
        'confirmed':    Order.query.filter_by(statut='confirmé').count(),
        'delivered':    Order.query.filter_by(statut='livré').count(),
        'total_revenue': float(total_revenue)
    }), 200