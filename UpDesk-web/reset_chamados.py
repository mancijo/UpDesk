from app import create_app
from app.extensions import db
from app.models import Chamado

app = create_app()

with app.app_context():
    try:
        num_deleted = db.session.query(Chamado).delete()
        db.session.commit()
        print(f"Foram excluídos {num_deleted} chamados do banco de dados.")
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao resetar chamados: {e}")