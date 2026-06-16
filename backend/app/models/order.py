# app/models/order.py
from datetime import datetime
from app.extensions import db

class Order(db.Model):
    __tablename__ = 'orders'

    id         = db.Column(db.Integer, primary_key=True)
    client     = db.Column(db.String(120), nullable=False)
    phone      = db.Column(db.String(30), nullable=False)
    email      = db.Column(db.String(120))
    produit    = db.Column(db.String(200), nullable=False)
    taille     = db.Column(db.String(10))
    couleur    = db.Column(db.String(50))
    prix       = db.Column(db.Float, nullable=False)
    adresse    = db.Column(db.Text)
    statut     = db.Column(db.String(30), default='en attente')  # 'en attente' | 'confirmé' | 'livré'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'client':     self.client,
            'phone':      self.phone,
            'email':      self.email,
            'produit':    self.produit,
            'taille':     self.taille,
            'couleur':    self.couleur,
            'prix':       self.prix,
            'adresse':    self.adresse,
            'statut':     self.statut,
            'created_at': self.created_at.strftime('%d/%m/%Y') if self.created_at else None,
        }