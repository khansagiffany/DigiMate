# main.py
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import func  # Tambahkan import ini
import os
import uuid
import requests

app = Flask(__name__)

# Konfigurasi CORS yang lebih spesifik
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Konfigurasi database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///digimate.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Tambahkan konfigurasi uploads folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize database
db = SQLAlchemy(app)

# Model Profile
class Profile(db.Model):
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Name")
    age = db.Column(db.String(50), nullable=False, default="Age")
    role = db.Column(db.String(100), nullable=False, default="Role")
    photo = db.Column(db.String(200), nullable=False, default="/profile.jpg")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'name': self.name,
            'age': self.age,
            'role': self.role,
            'photo': self.photo,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Model Task
class Task(db.Model):
    __tablename__ = 'task'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Model Chat dengan indeks
class Chat(db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False, index=True)  # Tambahkan index
    type = db.Column(db.String(20), nullable=False)  # 'user' atau 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)  # Tambahkan index
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_session_created', 'session_id', 'created_at'),  # Composite index
    )

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'type': self.type,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Import dan setup routes
from routes.profile_routes import setup_profile_routes
from routes.task_routes import setup_task_routes
from routes.chat_routes import setup_chat_routes

setup_profile_routes(app, db, Profile)
setup_task_routes(app, db, Task)
setup_chat_routes(app, db, Chat)

# Route untuk mengakses file uploads
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Create database tables
with app.app_context():
    # Drop existing tables first
    db.drop_all()
    # Create all tables
    db.create_all()
    # Create default profile if not exists
    if not Profile.query.first():
        default_profile = Profile()
        db.session.add(default_profile)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)