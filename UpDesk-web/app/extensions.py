from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Instancia as extensões para serem inicializadas na factory
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()