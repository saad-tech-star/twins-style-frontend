from datetime import datetime
from app import db

class Product(db.Model):
    __tablename__ = 'products'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(200), nullable=False)
    slug        = db.Column(db.String(200), nullable=False, unique=True)
    description = db.Column(db.Text)
    price       = db.Column(db.Numeric(10, 2), nullable=False)
    old_price   = db.Column(db.Numeric(10, 2))
    stock       = db.Column(db.Integer, default=0)
    sizes       = db.Column(db.JSON)
    colors      = db.Column(db.JSON)
    images      = db.Column(db.JSON)
    is_active   = db.Column(db.Boolean, default=True)
    is_featured = db.Column(db.Boolean, default=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow,
                            onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'price': float(self.price),
            'old_price': float(self.old_price) if self.old_price else None,
            'stock': self.stock,
            'sizes': self.sizes or [],
            'colors': self.colors or [],
            'images': self.images or [],
            'is_active': self.is_active,
            'is_featured': self.is_featured,
            'category': self.category.to_dict() if self.category else None,
            'created_at': self.created_at.isoformat()
        }