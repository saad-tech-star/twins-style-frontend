import os
import uuid
from PIL import Image
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return (
        '.' in filename and
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )

def save_image(file, subfolder='products'):
    if not file or not allowed_file(file.filename):
        return None

    ext      = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = current_app.config['UPLOAD_FOLDER']
    dest_folder   = os.path.join(upload_folder, subfolder)
    os.makedirs(dest_folder, exist_ok=True)

    filepath = os.path.join(dest_folder, filename)

    img = Image.open(file)
    img = img.convert('RGB')
    img.thumbnail((1200, 1200), Image.LANCZOS)
    img.save(filepath, optimize=True, quality=85)

    return f"{subfolder}/{filename}"

def delete_image(filepath):
    if not filepath:
        return
    upload_folder = current_app.config['UPLOAD_FOLDER']
    full_path     = os.path.join(upload_folder, filepath)
    if os.path.exists(full_path):
        os.remove(full_path)