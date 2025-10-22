import os
import sys

# Garantir que o diretório raiz do projeto esteja no path para importar o pacote 'app'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.services import buscar_solucao_com_ia

app = create_app()
with app.app_context():
    print(buscar_solucao_com_ia('Teste', 'Um app trava na inicialização'))
