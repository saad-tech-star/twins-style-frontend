from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.admin_user import AdminUser

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            admin = AdminUser.query.get(user_id)
            if not admin or not admin.is_active:
                return jsonify({'error': 'Accès refusé'}), 403
        except Exception:
            return jsonify({'error': 'Token invalide ou manquant'}), 401
        return fn(*args, **kwargs)
    return wrapper
    