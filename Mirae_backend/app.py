from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.avatar_routes import avatar_bp
from routes.journal_routes import journal_bp
from routes.reminisce_routes import reminisce_bp
from routes.insights_routes import insights_bp
from routes.agent_routes import agent_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp)
    app.register_blueprint(avatar_bp)
    app.register_blueprint(journal_bp)
    app.register_blueprint(reminisce_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(agent_bp)


    

    return app
