from flask import request, jsonify
import os
from werkzeug.utils import secure_filename
import base64
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def setup_profile_routes(app, db, Profile):
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    def get_profile():
        return Profile.query.first()

    @app.route('/api/profile', methods=['GET'])
    def get_profile_route():
        profile = get_profile()
        return jsonify(profile.to_dict())

    @app.route('/api/profile', methods=['PUT'])
    def update_profile():
        profile = get_profile()
        data = request.json
        
        if 'name' in data:
            profile.name = data['name']
        if 'age' in data:
            profile.age = data['age']
        if 'role' in data:
            profile.role = data['role']
        if 'photo' in data:
            profile.photo = data['photo']
        
        db.session.commit()
        return jsonify(profile.to_dict())

    @app.route('/api/profile/photo', methods=['POST'])
    def update_photo():
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400
        
        photo = request.files['photo']
        profile = get_profile()
        
        if photo.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if photo and allowed_file(photo.filename):
            filename = secure_filename(f"{datetime.now().timestamp()}_{photo.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            photo.save(filepath)
            
            profile.photo = f"/uploads/{filename}"
            db.session.commit()
            
            return jsonify({'photo': profile.photo})
        
        return jsonify({'error': 'Invalid file type'}), 400

    @app.route('/api/profile/photo/base64', methods=['POST'])
    def update_photo_base64():
        data = request.json
        profile = get_profile()
        
        if 'photo' not in data:
            return jsonify({'error': 'No photo provided'}), 400
        
        try:
            base64_string = data['photo'].split(',')[1]
            file_ext = data['photo'].split(';')[0].split('/')[1]
            
            filename = f"{datetime.now().timestamp()}.{file_ext}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(base64_string))
            
            profile.photo = f"/uploads/{filename}"
            db.session.commit()
            
            return jsonify({'photo': profile.photo})
        
        except Exception as e:
            return jsonify({'error': str(e)}), 400