"""
Script para atualizar o campo `cargo` de um usuário para 'Supervisor'.
Uso: rodar com o venv do projeto ativo.
"""
import sys
import os

# Ajusta o PYTHONPATH para permitir importar o pacote `app` quando o script
# é executado a partir da raiz do projeto ou de outra pasta.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models import Usuario

EMAIL = "mariozanjunior@updesk.com.br"

app = create_app()
with app.app_context():
    u = Usuario.query.filter_by(email=EMAIL).first()
    if u:
        old = u.cargo
        u.cargo = "Supervisor"
        db.session.commit()
        print(f"Usuário encontrado: {u.nome} ({EMAIL}). Cargo anterior: '{old}'. Agora: 'Supervisor'.")
    else:
        print(f"Usuário com email {EMAIL} não encontrado.")
