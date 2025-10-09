"""
Arquivo de Ambiente do Alembic (Flask-Migrate)

Responsabilidade:
- Este arquivo é o script de configuração que o Alembic executa ao rodar um comando de migração.
- Sua principal função é conectar o Alembic ao banco de dados da aplicação Flask e fornecer a ele
  os metadados dos modelos (de `app/models.py`) para que ele possa detectar alterações no esquema.
- É um arquivo majoritariamente gerado automaticamente e raramente precisa de edição manual, a não ser
  para configurações avançadas de migração.
"""
import logging
from logging.config import fileConfig

from flask import current_app

from alembic import context

# Este é o objeto de Configuração do Alembic, que fornece
# acesso aos valores dentro do arquivo .ini em uso.
config = context.config

# Interpreta o arquivo de configuração para o logging do Python.
# Esta linha basicamente configura os loggers.
fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')


def get_engine():
    try:
        # isso funciona com Flask-SQLAlchemy<3 e Alchemical
        return current_app.extensions['migrate'].db.get_engine()
    except (TypeError, AttributeError):
        # isso funciona com Flask-SQLAlchemy>=3
        return current_app.extensions['migrate'].db.engine


def get_engine_url():
    try:
        return get_engine().url.render_as_string(hide_password=False).replace(
            '%', '%%')
    except AttributeError:
        return str(get_engine().url).replace('%', '%%')


# adicione o objeto MetaData do seu modelo aqui
# para suporte a 'autogenerate'
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
import logging
from logging.config import fileConfig

from alembic import context
from flask import current_app
from sqlalchemy.engine import Engine
from sqlalchemy.schema import MetaData

# --- Configuração Inicial do Alembic ---

# Objeto de configuração do Alembic, com acesso aos valores do alembic.ini
config = context.config

# Configura o logger com base no arquivo .ini
if config.config_file_name:
    fileConfig(config.config_file_name)
logger = logging.getLogger('alembic.env')

# --- Funções Auxiliares para Integração com Flask ---

def get_flask_db_object():
    """
    Obtém o objeto SQLAlchemy (db) da extensão Flask-Migrate na aplicação Flask.
    """
    return current_app.extensions['migrate'].db

def get_engine() -> Engine:
    """
    Obtém o Engine do SQLAlchemy a partir da aplicação Flask.
    Lida com diferentes versões do Flask-SQLAlchemy.
    """
    db_object = get_flask_db_object()
    # Para Flask-SQLAlchemy >= 3
    if hasattr(db_object, 'engine'):
        return db_object.engine
    # Para Flask-SQLAlchemy < 3
    return db_object.get_engine()

def get_metadata() -> MetaData:
    """
    Obtém o objeto MetaData dos modelos da aplicação para o 'autogenerate'.
    """
    db_object = get_flask_db_object()
    if hasattr(db_object, 'metadatas'):
        return db_object.metadatas[None]
    return db_object.metadata

# --- Configuração Principal do Contexto do Alembic ---

# Define dinamicamente a URL do banco de dados para o Alembic
# usando a mesma configuração da aplicação Flask.
engine = get_engine()
config.set_main_option('sqlalchemy.url', str(engine.url).replace('%', '%%'))

# Define o metadata dos modelos para que o Alembic possa detectar alterações.
target_metadata = get_metadata()

def run_migrations_offline() -> None:
    """
    Executa migrações no modo 'offline'.
    Gera um script SQL sem se conectar ao banco de dados.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """
    Executa migrações no modo 'online'.
    Conecta-se ao banco de dados e aplica as alterações.
    """
    # Callback para evitar a criação de migrações vazias.
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('Nenhuma alteração no esquema detectada.')

    conf_args = current_app.extensions['migrate'].configure_args
    if "process_revision_directives" not in conf_args:
        conf_args["process_revision_directives"] = process_revision_directives

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            **conf_args
        )

        with context.begin_transaction():
            context.run_migrations()

# --- Ponto de Entrada ---

if context.is_offline_mode():
    logger.info("Executando migrações no modo offline...")
    run_migrations_offline()
else:
    logger.info("Executando migrações no modo online...")
    run_migrations_online()

target_db = current_app.extensions['migrate'].db

# outros valores da configuração, definidos pelas necessidades de env.py,
# podem ser adquiridos:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_metadata():
    if hasattr(target_db, 'metadatas'):
        return target_db.metadatas[None]
    return target_db.metadata


def run_migrations_offline():
    """Executa migrações no modo 'offline'.

    Isso configura o contexto apenas com uma URL
    e não um Engine, embora um Engine seja aceitável
    aqui também. Ao pular a criação do Engine
    nem precisamos de um DBAPI disponível.

    Chamadas para context.execute() aqui emitem a string fornecida para a
    saída do script.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url, target_metadata=get_metadata(), literal_binds=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Executa migrações no modo 'online'.

    Neste cenário, precisamos criar um Engine
    e associar uma conexão ao contexto.

    """

    # este callback é usado para evitar que uma auto-migração seja gerada
    # quando não há alterações no esquema
    # referência: http://alembic.zzzcomputing.com/en/latest/cookbook.html
    def process_revision_directives(context, revision, directives):
        if getattr(config.cmd_opts, 'autogenerate', False):
            script = directives[0]
            if script.upgrade_ops.is_empty():
                directives[:] = []
                logger.info('Nenhuma alteração no esquema detectada.')

    conf_args = current_app.extensions['migrate'].configure_args
    if conf_args.get("process_revision_directives") is None:
        conf_args["process_revision_directives"] = process_revision_directives

    connectable = get_engine()

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=get_metadata(),
            **conf_args
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()