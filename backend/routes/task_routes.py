from flask import request, jsonify

def setup_task_routes(app, db, Task):
    @app.route('/api/tasks', methods=['GET'])
    def get_tasks():
        tasks = Task.query.order_by(Task.created_at.desc()).all()
        return jsonify([task.to_dict() for task in tasks])

    @app.route('/api/tasks', methods=['POST'])
    def create_task():
        data = request.json
        new_task = Task(
            text=data['text'],
            completed=data.get('completed', False)
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict())

    @app.route('/api/tasks/<int:task_id>', methods=['PUT'])
    def update_task(task_id):
        task = Task.query.get_or_404(task_id)
        data = request.json
        
        if 'completed' in data:
            task.completed = data['completed']
        if 'text' in data:
            task.text = data['text']
            
        db.session.commit()
        return jsonify(task.to_dict())

    @app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
    def delete_task(task_id):
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200