"""
Arquivo de Extensões do Flask

Responsabilidade:
- Instanciar os objetos das extensões do Flask (ex: SQLAlchemy, Migrate, CORS).
- Manter as instâncias aqui, separadas da criação da aplicação (no __init__.py), é uma boa prática
  que previne problemas de importação circular. As extensões são então vinculadas à aplicação
  usando o padrão `db.init_app(app)` dentro da fábrica de aplicação.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Instancia o SQLAlchemy, que é o ORM (Object-Relational Mapper) para interagir com o banco de dados.
db = SQLAlchemy()

# Instancia o Flask-Migrate, que gerencia as migrações do banco de dados (alterações de esquema) usando o Alembic.
migrate = Migrate()

# Instancia o Flask-CORS, que lida com as políticas de Cross-Origin Resource Sharing,
# permitindo que o frontend (em um domínio diferente) faça requisições para esta API.
cors = CORS()