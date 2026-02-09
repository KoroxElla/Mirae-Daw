from flask import Flask
from flask_cors import CORS
from routes.emotion_routes import emotion_bp
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(emotion_bp)

    return app
