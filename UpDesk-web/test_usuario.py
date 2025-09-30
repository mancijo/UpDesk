import pytest
from main import create_app, db, Usuario  # ajuste o import conforme o nome do seu projeto


@pytest.fixture
def client():
    # Cria uma instância do app para teste com configurações específicas
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",  # banco em memória para teste
        "WTF_CSRF_ENABLED": False # Desabilita CSRF para testes de formulário
    })

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # cria um usuário de teste
            usuario = Usuario(
                nome="Mateus",
                email="mateus@teste.com",
                telefone="123456789",
                setor="TI",
                cargo="Dev",
                senha="1234"
            )
            db.session.add(usuario)
            db.session.commit()
        yield client


def test_editar_usuario(client):
    # Para interagir com o app/db fora de uma request, precisamos do contexto
    app = client.application
    with app.app_context():
        usuario = Usuario.query.first()
        usuario_id = usuario.id

    # Faz a requisição POST para editar
    response = client.post(f"/editar_usuario/{usuario_id}", data={
        "nome": "Mateus Atualizado",
        "email": "mateus@novo.com",
        "telefone": "987654321",
        "setor": "Engenharia",
        "cargo": "Analista",
        "senha": "4321"
    })

    # Verifica se a resposta foi bem-sucedida
    assert response.status_code == 200
    assert response.get_json()["mensagem"] == "Usuário atualizado com sucesso!"

    # Confirma se o usuário foi atualizado no banco dentro do contexto
    with app.app_context():
        usuario_atualizado = db.session.get(Usuario, usuario_id)
        assert usuario_atualizado.nome == "Mateus Atualizado"
        assert usuario_atualizado.email == "mateus@novo.com"
