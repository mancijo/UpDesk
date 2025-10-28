import os
import sys
this_dir = os.path.dirname(__file__)
# ensure project root (UpDesk-web) is on sys.path so 'app' can be imported
project_root = os.path.abspath(os.path.join(this_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app import create_app
from app.blueprints.chamados import ver_chamados

app = create_app()
with app.test_request_context('/chamados/ver'):
    resp = ver_chamados()
    print('View executed, type:', type(resp))
