# task.py
from flask import request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy
db = SQLAlchemy()

# Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }

def setup_task_routes(app):
    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        tasks = Task.query.order_by(Task.created_at.desc()).all()
        return jsonify([task.to_dict() for task in tasks])

    @app.route('/tasks', methods=['POST'])
    def create_task():
        data = request.json
        new_task = Task(
            text=data['text'],
            completed=data.get('completed', False)
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict())

    @app.route('/tasks/<int:task_id>', methods=['PUT'])
    def update_task(task_id):
        task = Task.query.get_or_404(task_id)
        data = request.json
        
        if 'completed' in data:
            task.completed = data['completed']
        if 'text' in data:
            task.text = data['text']
            
        db.session.commit()
        return jsonify(task.to_dict())

    @app.route('/tasks/<int:task_id>', methods=['DELETE'])
    def delete_task(task_id):
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200