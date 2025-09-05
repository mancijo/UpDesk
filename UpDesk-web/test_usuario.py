import pytest
from main import app, db, Usuario  # ajuste o import conforme o nome do seu projeto


@pytest.fixture
def client():
    # Configura o app para modo de teste
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # banco em memória para teste
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
    # Pega o usuário criado no fixture
    with app.app_context():
        usuario = Usuario.query.first()
        usuario_id = usuario.id

    # Faz a requisição POST para editar
    response = client.post(f"/editar_usuario/{usuario.id}", data={
        "nome": "Mateus Atualizado",
        "email": "mateus@novo.com",
        "telefone": "987654321",
        "setor": "Engenharia",
        "cargo": "Analista",
        "senha": "4321"
    })

    # Verifica se a resposta foi 200
    assert response.status_code == 200
    assert response.get_json()["mensagem"] == "Usuário atualizado com sucesso!"

    # Confirma se o usuário foi atualizado no banco
    usuario_atualizado = Usuario.query.get(usuario.id)
    assert usuario_atualizado.nome == "Mateus Atualizado"
    assert usuario_atualizado.email == "mateus@novo.com"
