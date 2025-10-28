"""
Fábrica de Aplicação (Application Factory)

Responsabilidade:
- Conter a função `create_app` que é responsável por criar e configurar a instância principal da aplicação Flask.
- Isolar a criação da aplicação permite ter múltiplas instâncias com diferentes configurações (ex: для testes) e evita problemas de importação circular.
"""
from flask import Flask
from config import Config

def create_app(config_class=Config):
    """
    Cria e configura a instância do Flask.
    
    Args:
        config_class: A classe de configuração a ser usada (padrão: `Config` de config.py).
    
    Returns:
        A instância da aplicação Flask configurada.
    """
    # Cria a instância do Flask.
    # - `instance_relative_config=True`: Permite carregar configurações de uma pasta 'instance'.
    # - `template_folder` e `static_folder`: Aponta para as pastas corretas dentro do pacote 'app'.
    app = Flask(__name__, 
                instance_relative_config=True,
                template_folder='templates',
                static_folder='static')
    
    # Carrega as configurações a partir do objeto/classe fornecido (ex: `config.Config`).
    app.config.from_object(config_class)

    # --- Inicialização das Extensões ---
    # Associa as extensões do Flask (como SQLAlchemy, Migrate, CORS) com a instância da aplicação.
    from .extensions import db, migrate, cors
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Filtro Jinja2 para codificar em base64
    import base64
    def to_base64(data):
        if isinstance(data, bytes):
            return base64.b64encode(data).decode('utf-8')
        return data
    app.jinja_env.filters['to_base64'] = to_base64

    # O `app_context` é necessário para operações que dependem da aplicação, como interagir com o banco.
    with app.app_context():
        # Inicializa serviços customizados, como o serviço de IA.
        from . import services
        services.init_ia()

        # --- Registro dos Blueprints ---
        # Blueprints são como "mini-aplicações" que organizam as rotas.
        # Aqui, importamos e registramos cada um deles na aplicação principal.
        from .blueprints import main, auth, chamados, usuarios
        app.register_blueprint(main.bp)
        app.register_blueprint(auth.bp)
        app.register_blueprint(chamados.bp)
        app.register_blueprint(usuarios.bp)

    return app

