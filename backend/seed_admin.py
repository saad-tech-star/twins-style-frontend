# backend/seed_admin.py
from app import create_app, db
from app.models.admin_user import AdminUser
import sys

def seed_admin():
    app = create_app()
    with app.app_context():
        # Check if admin already exists
        admin_email = "admin@myfashion.com"
        existing_admin = AdminUser.query.filter_by(email=admin_email).first()
        
        if existing_admin:
            print(f"Admin user with email {admin_email} already exists.")
            return

        # Create new admin
        admin = AdminUser(
            username="admin",
            email=admin_email
        )
        # Assuming set_password is a method in AdminUser model
        admin.set_password("adminpassword123")
        
        try:
            db.session.add(admin)
            db.session.commit()
            print("Successfully created admin user!")
            print(f"Email: {admin_email}")
            print("Password: adminpassword123")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {e}")

if __name__ == "__main__":
    seed_admin()
