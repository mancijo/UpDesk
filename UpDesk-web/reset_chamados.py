"""
Script para zerar os chamados do sistema.

O que ele faz:
- Apaga todas as Interações vinculadas aos chamados (para evitar violação de FK);
- Apaga todos os Chamados;
- (Opcional) Reinicia o contador de identidade (ID) das tabelas no SQL Server.

Uso:
    python UpDesk-web/reset_chamados.py
"""

from sqlalchemy import text
from app import create_app
from app.extensions import db
from app.models import Chamado, Interacao

app = create_app()

with app.app_context():
    try:
        # 1) Apaga as interações primeiro (dependentes)
        interacoes_del = db.session.query(Interacao).delete(synchronize_session=False)

        # 2) Apaga os chamados
        chamados_del = db.session.query(Chamado).delete(synchronize_session=False)

        # 3) (Opcional) Reseed dos IDs no SQL Server
        # Ignora caso o banco não seja SQL Server ou se não houver permissão
        try:
            db.session.execute(text("DBCC CHECKIDENT ('Interacoes', RESEED, 0)"))
            db.session.execute(text("DBCC CHECKIDENT ('Chamado', RESEED, 0)"))
        except Exception:
            # Não é crítico para o reset; apenas segue.
            pass

        db.session.commit()
        print(
            f"Reset concluído: Interações excluídas={interacoes_del}, Chamados excluídos={chamados_del}."
        )
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao resetar chamados: {e}")