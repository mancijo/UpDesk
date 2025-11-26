"""
Cria as tabelas principais no SQL Server usando os modelos ORM.

Uso:
    python scripts/create_tables.py

Pré-requisitos:
    - Variáveis de ambiente de conexão configuradas (ver `UpDesk-web/config.py`).
    - Ambiente virtual ativo com dependências instaladas (`pip install -r requirements.txt`).
"""
import os
import sys

# Garante que o pacote `app` esteja no PYTHONPATH quando executado via script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import create_app
from app.extensions import db


def main():
    app = create_app()
    with app.app_context():
        # Importar modelos garante que SQLAlchemy conheça todas as tabelas
        from app import models  # noqa: F401

        print("Criando tabelas (se não existirem)...")
        db.create_all()
        print("Concluído.")


if __name__ == "__main__":
    main()
