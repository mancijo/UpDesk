import sys
import os
from werkzeug.security import generate_password_hash

# Adiciona o diretório raiz do projeto ao path do Python
# para que possamos importar os módulos da aplicação (app, models, etc.)
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.extensions import db
from app.models import Usuario

def adicionar_usuario(nome, email, senha, cargo):
    """
    Cria um novo usuário no banco de dados com a senha criptografada.
    """
    app = create_app()
    with app.app_context():
        # Verifica se o usuário já existe
        if Usuario.query.filter_by(email=email).first():
            print(f"Erro: O usuário com o email '{email}' já existe.")
            return

        # Gera o hash da senha
        senha_hash = generate_password_hash(senha)

        # Cria a nova instância do usuário
        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha=senha_hash,
            cargo=cargo,
            ativo=True
        )

        # Adiciona ao banco de dados
        db.session.add(novo_usuario)
        db.session.commit()
        print(f"Usuário '{nome}' criado com sucesso!")

if __name__ == '__main__':
    # Dados do usuário a ser criado
    NOME_USUARIO = "Mariozan Junior"
    EMAIL_USUARIO = "mariozan.junior@updesk.com"
    SENHA_USUARIO = "123456"
    CARGO_USUARIO = "Supervisor"
    
    adicionar_usuario(NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CARGO_USUARIO)
