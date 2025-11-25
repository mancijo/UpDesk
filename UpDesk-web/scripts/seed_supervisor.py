"""Seed de usuário Supervisor padrão.
Cria um supervisor se não existir.
Uso:
    python UpDesk-web/scripts/seed_supervisor.py --email supervisor@updesk.local --senha 123456
"""
import os
import sys
import argparse
from werkzeug.security import generate_password_hash

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import create_app
from app.extensions import db
from app.models import Usuario

parser = argparse.ArgumentParser()
parser.add_argument('--email', default='supervisor@updesk.local')
parser.add_argument('--senha', default='123456')
parser.add_argument('--nome', default='Supervisor Padrão')
args = parser.parse_args()

app = create_app()
with app.app_context():
    existente = Usuario.query.filter_by(email=args.email).first()
    if existente:
        print(f"Já existe supervisor com email {args.email} (id={existente.id}). Nada a fazer.")
    else:
        sup = Usuario(
            nome=args.nome,
            email=args.email,
            telefone='(11)0000-0000',
            setor='Tecnologia e Inovação',
            cargo='Supervisor',
            senha=generate_password_hash(args.senha),
            ativo=True
        )
        db.session.add(sup)
        db.session.commit()
        print(f"Supervisor criado: id={sup.id}, email={sup.email}")
