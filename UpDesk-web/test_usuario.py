<<<<<<< HEAD
import pytest
from main import create_app, db, Usuario  # ajuste o import conforme o nome do seu projeto
=======
"""
Arquivo de Testes para Funcionalidades de Usuário
>>>>>>> d82b71defb868dcbfd244450643bece347d1141a

Responsabilidade:
- Testar as rotas e a lógica de negócio relacionadas ao gerenciamento de usuários.
- Utiliza o `pytest` como framework de testes.
- Garante que as funcionalidades de CRUD de usuário (neste caso, a edição) funcionem como esperado.
"""
import pytest
from app import create_app
from app.extensions import db
from app.models import Usuario
from werkzeug.security import generate_password_hash

@pytest.fixture
<<<<<<< HEAD
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
=======
def app_instance():
    """
    Fixture do Pytest para criar e configurar uma instância da aplicação para cada teste.
    
    - Isola cada teste em seu próprio ambiente.
    - Configura um banco de dados SQLite em memória para não tocar no banco real.
    - Cria um usuário de teste para ser usado nos testes.
    - Limpa o banco de dados ao final de cada teste.
    """
    app = create_app()
    app.config.update({
        "TESTING": True, # Habilita o modo de teste do Flask
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # Usa um banco de dados em memória
        "WTF_CSRF_ENABLED": False,  # Desabilita a proteção CSRF para simplificar os testes de formulário
        "SECRET_KEY": "test-secret-key" # Garante uma chave de sessão para os testes
    })

    # O `app_context` é necessário para interagir com o banco de dados
    with app.app_context():
        db.create_all() # Cria todas as tabelas do banco em memória
        
        # Cria um usuário de teste com senha hasheada para ser usado no teste
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

    # `yield` entrega a instância da aplicação para o teste
    yield app

    # Código de limpeza (executado após o teste terminar)
    with app.app_context():
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app_instance):
    """Fixture que cria um cliente de teste para fazer requisições à aplicação."""
    return app_instance.test_client()

def test_editar_usuario(client, app_instance):
    """
    Testa a funcionalidade de edição de um usuário através da rota `/usuarios/editar/<id>`.
    
    Segue o padrão Arrange-Act-Assert:
    - Arrange (Preparar): Obtém o ID do usuário de teste.
    - Act (Agir): Envia uma requisição POST para a rota de edição com novos dados.
    - Assert (Verificar): Confere se a resposta da API está correta e se os dados no banco 
      foram de fato atualizados.
    """
    # Arrange: Prepara o ambiente para o teste
    with app_instance.app_context():
        usuario = Usuario.query.first()
        assert usuario is not None, "O usuário de teste não foi criado corretamente."
        usuario_id = usuario.id

        # A rota de edição está no blueprint 'usuarios'
        url_editar = f"/usuarios/editar/{usuario_id}"

        # Act: Executa a ação a ser testada
        # Envia uma requisição POST para a URL de edição com os dados do formulário.
        response = client.post(url_editar, data={
            "nome": "Mateus Atualizado",
            "email": "mateus@novo.com",
            "telefone": "987654321",
            "setor": "Engenharia",
            "cargo": "Analista",
            "senha": "" # Deixar em branco para não alterar a senha
        }, follow_redirects=True)

        # Assert: Verifica os resultados
        # 1. Verifica se a resposta da API foi bem-sucedida (código 200 OK)
        assert response.status_code == 200
        response_data = response.get_json()
        assert response_data is not None, "A resposta não contém JSON."
        assert response_data["mensagem"] == "Usuário atualizado com sucesso!"

        # 2. Verifica se os dados foram realmente persistidos no banco de dados
        usuario_atualizado = db.session.get(Usuario, usuario_id)
        assert usuario_atualizado.nome == "Mateus Atualizado"
        assert usuario_atualizado.email == "mateus@novo.com"
>>>>>>> d82b71defb868dcbfd244450643bece347d1141a
