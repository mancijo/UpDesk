"""
Arquivo de Configuração da Aplicação

Responsabilidade:
- Centralizar todas as configurações da aplicação Flask.
- Carregar informações sensíveis (como senhas de banco e chaves de API) a partir de variáveis de ambiente
  para não deixá-las expostas no código-fonte (prática de segurança).
- Utiliza a biblioteca `python-dotenv` para carregar um arquivo `.env` localmente durante o desenvolvimento.
"""
import os
import urllib.parse
from dotenv import load_dotenv

# Carrega as variáveis de ambiente definidas no arquivo .env para o ambiente atual.
# Isso permite que `os.getenv()` encontre as variáveis durante o desenvolvimento.
load_dotenv()

class Config:
    """Define as configurações da aplicação em uma classe para melhor organização."""
    
    # Chave secreta usada pelo Flask para assinar digitalmente os dados da sessão (cookies).
    # É crucial para a segurança contra a manipulação de cookies.
    # O valor é lido do ambiente, com um fallback inseguro apenas para desenvolvimento fácil.
    SECRET_KEY = os.getenv('SECRET_KEY', 'uma-chave-secreta-padrao-super-segura')
    
    # --- Configuração do Banco de Dados SQL Server ---
    # As credenciais são lidas das variáveis de ambiente para evitar expô-las no código.
    DB_DRIVER = os.getenv('DB_DRIVER', '{ODBC Driver 17 for SQL Server}')
    DB_SERVER = os.getenv('DB_SERVER')
    DB_DATABASE = os.getenv('DB_DATABASE')
    DB_UID = os.getenv('DB_UID')
    DB_PWD = os.getenv('DB_PWD')

    # Monta a string de conexão (ConnectionString) para o SQLAlchemy.
    # `urllib.parse.quote_plus` é usado para codificar caracteres especiais na string de conexão,
    # prevenindo erros e possíveis ataques de injeção.
    _params = urllib.parse.quote_plus(
        f"Driver={{{DB_DRIVER}}};"
        f"Server={DB_SERVER};"
        f"Database={DB_DATABASE};"
        f"UID={DB_UID};"
        f"PWD={{{DB_PWD}}};"
    )
    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={_params}"
    
    # Desativa um recurso do SQLAlchemy que emite sinais a cada modificação no banco.
    # Desativar melhora a performance e é a configuração recomendada.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Chave da API do Google Gemini, lida a partir das variáveis de ambiente.
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
