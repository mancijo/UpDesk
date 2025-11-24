"""
Fábrica de Aplicação (Application Factory)

Responsabilidade:
- Conter a função `create_app` que é responsável por criar e configurar a instância principal da aplicação Flask.
- Isolar a criação da aplicação permite ter múltiplas instâncias com diferentes configurações (ex: для testes) e evita problemas de importação circular.
"""
from flask import Flask, session, redirect, url_for, flash
import time
import os
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
    # Versão estática para cache-busting em desenvolvimento
    app.config.setdefault('STATIC_VERSION', int(time.time()))
    # Gera um salt de sessão único por execução do servidor.
    # Ao trocar esse valor (a cada reinício), invalida sessões antigas
    # Força o usuário a fazer login novamente após restart.
    app.config['SESSION_SALT'] = os.urandom(16).hex()

    # --- Inicialização das Extensões ---
    # Associa as extensões do Flask (como SQLAlchemy, Migrate, CORS) com a instância da aplicação.
    from .extensions import db, migrate, cors, csrf
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    csrf.init_app(app)

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

    from flask import request

    @app.before_request
    def enforce_session_salt():
        """Se existir sessão mas o salt não bater com o atual do app,
        a sessão é limpa e o usuário é redirecionado para a tela de login.
        Isso faz com que após reiniciar a aplicação todos precisem logar novamente.
        """
        # Não processar para rotas estáticas
        try:
            endpoint = (session and None)  # placeholder to avoid lint
        except Exception:
            endpoint = None
        # Evita interferir no fluxo de login/logout e em rotas estáticas
        endpoint = request.endpoint or ''
        if endpoint.startswith('auth.') or endpoint.startswith('static') or endpoint == 'main.index':
            return None

        # Apenas verifica se há um usuário logado
        if 'usuario_id' in session:
            current_salt = app.config.get('SESSION_SALT')
            sess_salt = session.get('session_salt')
            # Se a sessão explicitamente tem um salt e ele é diferente -> invalida
            if sess_salt and sess_salt != current_salt:
                # Invalida sessão antiga sem adicionar flash para evitar mensagens
                # exibidas imediatamente após o login.
                session.clear()
                return redirect(url_for('main.index'))
            # Se NÃO existe session_salt, consideramos sessão antiga (antes desta feature)
            # e também forçamos logout para evitar deixar sessões antigas ativas.
            if not sess_salt:
                # Sessão muito antiga - apenas invalida sem flash
                session.clear()
                return redirect(url_for('main.index'))

    # Context processor para expor cargo do usuário em todos os templates (colocado antes do return)
    @app.context_processor
    def inject_user_role():
        from .models import Usuario
        usuario_id = session.get('usuario_id')
        cargo_lower = ''
        if usuario_id:
            try:
                user = Usuario.query.get(usuario_id)
                cargo_lower = (user.cargo or '').strip().lower() if user else ''
            except Exception:
                cargo_lower = ''
        return {
            'user_cargo': cargo_lower,
            'is_supervisor': cargo_lower == 'supervisor'
        }

    return app

