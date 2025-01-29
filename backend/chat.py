from flask import jsonify, request
from datetime import datetime
import uuid
from sqlalchemy import func

def setup_chat_routes(app, db, Chat):
    @app.route('/api/chat-history', methods=['GET'])
    def get_chat_history():
        """
        Get chat history for current session
        """
        session_id = request.args.get('session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
            
        chats = Chat.query.filter_by(session_id=session_id)\
                        .order_by(Chat.created_at)\
                        .all()
        
        return jsonify([chat.to_dict() for chat in chats])

    @app.route('/api/chat/recent', methods=['GET'])
    def get_recent_chats():
        """
        Get recent chat sessions with their messages,
        ordered by the latest message in each session
        """
        
        latest_sessions = db.session.query(
            Chat.session_id,
            func.max(Chat.created_at).label('latest_message_time')
        ).group_by(
            Chat.session_id
        ).order_by(
            func.max(Chat.created_at).desc()
        ).limit(5).all()

        recent_chats = []
        
        
        for session_id, _ in latest_sessions:
            messages = Chat.query.filter_by(session_id=session_id)\
                               .order_by(Chat.created_at.asc())\
                               .all()
            
            if messages:
                recent_chats.append({
                    'session_id': session_id,
                    'messages': [msg.to_dict() for msg in messages]
                })

        return jsonify(recent_chats)

    @app.route('/api/chat-history', methods=['POST'])
    def save_messages():
        """
        Save new messages to database
        """
        try:
            messages = request.json
            session_id = request.args.get('session_id')
            
            if not session_id:
                session_id = str(uuid.uuid4())

            
            Chat.query.filter_by(session_id=session_id).delete()
        
            for message in messages:
                new_message = Chat(
                    session_id=session_id,
                    type=message['type'],
                    content=message['content'],
                    created_at=datetime.fromisoformat(message['created_at'].replace('Z', '+00:00'))
                )
                db.session.add(new_message)
            
            db.session.commit()
            
            chats = Chat.query.filter_by(session_id=session_id)\
                            .order_by(Chat.created_at)\
                            .all()
            
            return jsonify([chat.to_dict() for chat in chats])

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    return app