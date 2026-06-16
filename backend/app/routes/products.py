from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.product import Product
from app.models.category import Category
from app.utils.decorators import admin_required
from app.utils.upload import save_image, delete_image
import re

products_bp = Blueprint('products', __name__)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^\w-]', '', text)
    return text


# ─── PUBLIC ───────────────────────────────────────────────

@products_bp.route('/', methods=['GET'])
def get_products():
    page     = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    featured = request.args.get('featured')
    search   = request.args.get('search', '')
    sort_by  = request.args.get('sort', 'newest')

    query = Product.query.filter_by(is_active=True)

    if category:
        cat = Category.query.filter_by(slug=category).first()
        if cat:
            query = query.filter_by(category_id=cat.id)

    if featured:
        query = query.filter_by(is_featured=True)

    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))

    if sort_by == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort_by == 'price_desc':
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    pagination = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'products':     [p.to_dict() for p in pagination.items],
        'total':        pagination.total,
        'pages':        pagination.pages,
        'current_page': page
    }), 200


@products_bp.route('/featured', methods=['GET'])
def get_featured():
    products = Product.query.filter_by(
        is_featured=True, is_active=True
    ).limit(8).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.route('/<slug>', methods=['GET'])
def get_product(slug):
    product = Product.query.filter_by(
        slug=slug, is_active=True
    ).first()
    if not product:
        return jsonify({'error': 'Produit non trouvé'}), 404
    return jsonify(product.to_dict()), 200


# ─── ADMIN ────────────────────────────────────────────────

@products_bp.route('/admin/all', methods=['GET'])
@admin_required
def admin_get_all():
    products = Product.query.order_by(
        Product.created_at.desc()
    ).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.route('/admin/create', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json()

    for field in ['name', 'price', 'category_id']:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400

    slug     = slugify(data['name'])
    existing = Product.query.filter_by(slug=slug).first()
    if existing:
        slug = f"{slug}-{Product.query.count()}"

    product = Product(
        name        = data['name'],
        slug        = slug,
        description = data.get('description', ''),
        price       = data['price'],
        old_price   = data.get('old_price'),
        stock       = data.get('stock', 0),
        sizes       = data.get('sizes', []),
        colors      = data.get('colors', []),
        images      = data.get('images', []),
        is_featured = data.get('is_featured', False),
        category_id = data['category_id']
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


# RESTful endpoints expected by frontend (GET /products, POST /products, PUT /products/:id, DELETE /products/:id)
@products_bp.route('', methods=['POST'])
@admin_required
def create_product_rest():
    data = request.get_json()

    for field in ['name', 'price', 'category_id']:
        if not data.get(field):
            return jsonify({'error': f'{field} est requis'}), 400

    slug     = slugify(data['name'])
    existing = Product.query.filter_by(slug=slug).first()
    if existing:
        slug = f"{slug}-{Product.query.count()}"

    product = Product(
        name        = data['name'],
        slug        = slug,
        description = data.get('description', ''),
        price       = data['price'],
        old_price   = data.get('old_price'),
        stock       = data.get('stock', 0),
        sizes       = data.get('sizes', []),
        colors      = data.get('colors', []),
        images      = data.get('images', []),
        is_featured = data.get('is_featured', False),
        category_id = data['category_id']
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.route('/admin/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data    = request.get_json()

    for field in ['name', 'description', 'price', 'old_price',
                  'stock', 'sizes', 'colors', 'images',
                  'is_featured', 'is_active', 'category_id']:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.route('/<int:product_id>', methods=['PUT'])
@admin_required
def update_product_rest(product_id):
    product = Product.query.get_or_404(product_id)
    data    = request.get_json()

    for field in ['name', 'description', 'price', 'old_price',
                  'stock', 'sizes', 'colors', 'images',
                  'is_featured', 'is_active', 'category_id']:
        if field in data:
            setattr(product, field, data[field])

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.route('/admin/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    for img in (product.images or []):
        delete_image(img)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Produit supprimé'}), 200


@products_bp.route('/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product_rest(product_id):
    product = Product.query.get_or_404(product_id)
    for img in (product.images or []):
        delete_image(img)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Produit supprimé'}), 200


@products_bp.route('/admin/upload-image', methods=['POST'])
@admin_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Aucune image envoyée'}), 400

    file     = request.files['image']
    filepath = save_image(file, subfolder='products')

    if not filepath:
        return jsonify({'error': 'Format non supporté'}), 400

    return jsonify({'url': f"/uploads/{filepath}"}), 201