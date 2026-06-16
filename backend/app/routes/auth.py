from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime, timedelta
from app import db, limiter
from app.models.admin_user import AdminUser

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()

    if not data or not (data.get('username') or data.get('email')) or not data.get('password'):
        return jsonify({'error': 'Identifiant et password requis'}), 400

    identifier = data.get('username') or data.get('email')
    admin = AdminUser.query.filter(
        (AdminUser.username == identifier) | (AdminUser.email == identifier)
    ).first()

    if not admin or not admin.check_password(data['password']):
        return jsonify({'error': 'Identifiants incorrects'}), 401

    if not admin.is_active:
        return jsonify({'error': 'Compte désactivé'}), 403

    admin.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
        identity=admin.id,
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        'access_token': access_token,
        'admin': admin.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    admin   = AdminUser.query.get(user_id)
    if not admin:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    return jsonify(admin.to_dict()), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    admin   = AdminUser.query.get(user_id)
    data    = request.get_json()

    if not admin.check_password(data.get('old_password', '')):
        return jsonify({'error': 'Ancien mot de passe incorrect'}), 400

    new_pass = data.get('new_password', '')
    if len(new_pass) < 8:
        return jsonify({'error': 'Mot de passe trop court (min 8)'}), 400

    admin.set_password(new_pass)
    db.session.commit()
    return jsonify({'message': 'Mot de passe modifié avec succès'}), 200