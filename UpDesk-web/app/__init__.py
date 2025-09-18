from flask import Flask
from config import Config

def create_app(config_class=Config):
    """
    Fábrica de aplicação: cria e configura a instância do Flask.
    """
    # Aponta static e templates para dentro da pasta app
    app = Flask(__name__, 
                instance_relative_config=True,
                template_folder='templates',
                static_folder='static')
    
    app.config.from_object(config_class)

    # Inicializa extensões
    from .extensions import db, migrate, cors
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    with app.app_context():
        # Inicializa serviços (como a IA)
        from . import services
        services.init_ia()

        # Registra os Blueprints
        from .blueprints import main, auth, chamados, usuarios
        app.register_blueprint(main.bp)
        app.register_blueprint(auth.bp)
        app.register_blueprint(chamados.bp)
        app.register_blueprint(usuarios.bp)

    return app

