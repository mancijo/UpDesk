import os
import sys

# Garante que o diretório `UpDesk-web` esteja no sys.path para importar o pacote `app`
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)  # UpDesk-web/
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import create_app
from app.extensions import db
from app.models import Chamado, Interacao

app = create_app()

with app.app_context():
    chamados = db.session.query(Chamado).count()
    interacoes = db.session.query(Interacao).count()
    print(f"Chamados: {chamados} | Interacoes: {interacoes}")
