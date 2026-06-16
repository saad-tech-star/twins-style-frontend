# backend/seed_products.py
from app import create_app, db
from app.models.product import Product
from app.models.category import Category

def seed_products():
    app = create_app()
    with app.app_context():
        # Create Categories
        cats = ['Robes', 'Ensembles', 'Accessoires']
        cat_objs = {}
        for c in cats:
            slug = c.lower()
            cat = Category.query.filter_by(slug=slug).first()
            if not cat:
                cat = Category(name=c, slug=slug)
                db.session.add(cat)
                db.session.commit()
            cat_objs[slug] = cat

        # Create Products
        products_data = [
            {
                'name': 'Robe d\'été Élégante',
                'price': 450,
                'category_slug': 'robes',
                'description': 'Une robe légère et fluide parfaite pour les journées ensoleillées.',
                'stock': 10,
                'sizes': ['S', 'M', 'L'],
                'colors': ['Blanc', 'Bleu'],
                'images': ['/assets/dresses.png'],
                'is_featured': True
            },
            {
                'name': 'Ensemble Lin Naturel',
                'price': 750,
                'category_slug': 'ensembles',
                'description': 'Ensemble pantalon et haut en lin de haute qualité.',
                'stock': 5,
                'sizes': ['M', 'L'],
                'colors': ['Beige', 'Vert Olive'],
                'images': ['/assets/sets.png'],
                'is_featured': True
            },
            {
                'name': 'Robe de Soirée Prestige',
                'price': 1200,
                'category_slug': 'robes',
                'description': 'Robe de soirée élégante avec finitions raffinées.',
                'stock': 3,
                'sizes': ['S', 'M'],
                'colors': ['Noir', 'Or'],
                'images': ['/assets/dresses.png'],
                'is_featured': False
            }
        ]

        for p_data in products_data:
            cat = cat_objs[p_data['category_slug']]
            existing = Product.query.filter_by(name=p_data['name']).first()
            if not existing:
                p = Product(
                    name=p_data['name'],
                    slug=p_data['name'].lower().replace(' ', '-').replace("'", "-"),
                    price=p_data['price'],
                    description=p_data['description'],
                    stock=p_data['stock'],
                    sizes=p_data['sizes'],
                    colors=p_data['colors'],
                    images=p_data['images'],
                    is_featured=p_data['is_featured'],
                    category_id=cat.id
                )
                db.session.add(p)
        
        db.session.commit()
        print("Successfully seeded categories and products!")

if __name__ == "__main__":
    seed_products()
