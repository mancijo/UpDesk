"""
Script para Verificar a Conexão com o Banco de Dados

Responsabilidade:
- Inicializar a aplicação Flask usando a configuração definida em `config.py` e `.env`.
- Tentar estabelecer uma conexão com o banco de dados e executar uma consulta simples.
- Fornecer uma mensagem clara de sucesso ou falha.
"""
from app import create_app
from app.extensions import db
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy import text

# Cria uma instância da aplicação para carregar a configuração
app = create_app()

# O app_context é necessário para que o SQLAlchemy saiba a qual aplicação ele pertence
with app.app_context():
    try:
        # Tenta executar uma consulta SQL muito simples.
        # A função text() é usada para executar SQL bruto de forma segura.
        # Se esta linha executar sem erros, a conexão foi bem-sucedida.
        db.session.execute(text('SELECT 1'))
        
        print("✅ Conexão com o banco de dados estabelecida com sucesso!")
        print(f"URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

    except OperationalError as e:
        print("❌ Falha na conexão com o banco de dados (OperationalError).")
        print("Verifique os seguintes pontos:")
        print("1. O servidor de banco de dados está em execução?")
        print(f"   - Servidor configurado: {app.config.get('DB_SERVER')}")
        print("2. O nome do servidor e da instância estão corretos no arquivo .env?")
        print("3. As regras de firewall estão permitindo a conexão?")
        print(f"   - Erro original: {e}")

    except ProgrammingError as e:
        print("❌ Falha na autenticação com o banco de dados (ProgrammingError).")
        print("Verifique os seguintes pontos:")
        print("1. O banco de dados existe?")
        print(f"   - Banco de dados configurado: {app.config.get('DB_DATABASE')}")
        print("2. As credenciais (usuário/senha) ou a autenticação do Windows estão corretas?")
        print(f"   - Erro original: {e}")
        
    except Exception as e:
        print(f"❌ Ocorreu um erro inesperado: {e}")
