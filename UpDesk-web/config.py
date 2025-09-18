import os
import urllib.parse
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    """Classe de configuração principal."""
    
    # Chave secreta para segurança da sessão
    SECRET_KEY = os.getenv('SECRET_KEY', 'uma-chave-secreta-padrao-super-segura')
    
    # Configuração do banco de dados a partir de variáveis de ambiente
    DB_DRIVER = os.getenv('DB_DRIVER', '{ODBC Driver 17 for SQL Server}')
    DB_SERVER = os.getenv('DB_SERVER')
    DB_DATABASE = os.getenv('DB_DATABASE')
    DB_UID = os.getenv('DB_UID')
    DB_PWD = os.getenv('DB_PWD')

    # Monta a string de conexão de forma segura
    _params = urllib.parse.quote_plus(
        f"Driver={{{DB_DRIVER}}};"
        f"Server={DB_SERVER};"
        f"Database={DB_DATABASE};"
        f"UID={DB_UID};"
        f"PWD={{{DB_PWD}}};"
    )
    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={_params}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Chave da API do Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
