import pytest
from app import create_app
from app.extensions import db
from app.models import Usuario
from werkzeug.security import generate_password_hash

@pytest.fixture
def app_instance():
    """Cria e configura uma nova instância da aplicação para cada teste."""
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "WTF_CSRF_ENABLED": False,  # Desabilita CSRF para testes de formulário
        "SECRET_KEY": "test-secret-key" # Garante uma chave para a sessão
    })

    with app.app_context():
        db.create_all()
        # Cria um usuário de teste com senha hasheada
        hashed_password = generate_password_hash("1234")
        usuario = Usuario(
            nome="Mateus",
            email="mateus@teste.com",
            telefone="123456789",
            setor="TI",
            cargo="Dev",
            senha=hashed_password,
            ativo=True
        )
        db.session.add(usuario)
        db.session.commit()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app_instance):
    """Um cliente de teste para a aplicação."""
    return app_instance.test_client()

def test_editar_usuario(client, app_instance):
    """Testa a rota de edição de usuário."""
    with app_instance.app_context():
        usuario = Usuario.query.first()
        assert usuario is not None
        usuario_id = usuario.id

        # A rota agora está no blueprint 'usuarios', então a URL mudou
        url_editar = f"/usuarios/editar/{usuario_id}"

        # Faz a requisição POST para editar, enviando dados de formulário
        response = client.post(url_editar, data={
            "nome": "Mateus Atualizado",
            "email": "mateus@novo.com",
            "telefone": "987654321",
            "setor": "Engenharia",
            "cargo": "Analista",
            "senha": "" # Deixar em branco para não alterar
        }, follow_redirects=True)

        # Verifica se a resposta foi bem-sucedida (200 OK)
        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data is not None
        assert response_data["mensagem"] == "Usuário atualizado com sucesso!"

        # Confirma se o usuário foi realmente atualizado no banco de dados
        usuario_atualizado = db.session.get(Usuario, usuario_id)
        assert usuario_atualizado.nome == "Mateus Atualizado"
        assert usuario_atualizado.email == "mateus@novo.com"