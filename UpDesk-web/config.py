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
    
    # Modo debug padrão em desenvolvimento (pode ser desligado via variável de ambiente DEBUG=0)
    DEBUG = os.getenv('DEBUG', '1') == '1'

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

    # Permite fornecer a connection string completa via variável de ambiente
    # Aceitamos variações comuns: DEFAULT_CONNECTION, ConnectionStrings__DefaultConnection
    # Exemplo que pode vir do usuário / JSON samples:
    # "Server=updesk-db.c9amamg4cvnf.sa-east-1.rds.amazonaws.com,1433;Database=updesk-db;User Id=admin;Password=...;Encrypt=True;TrustServerCertificate=True;"
    DEFAULT_CONNECTION = (
        os.getenv('DEFAULT_CONNECTION')
        or os.getenv('ConnectionStrings__DefaultConnection')
        or os.getenv('ConnectionStrings:DefaultConnection')
    )

    # Monta a string de conexão (ConnectionString) para o SQLAlchemy.
    # `urllib.parse.quote_plus` é usado para codificar caracteres especiais na string de conexão.
    if DEFAULT_CONNECTION:
        # Normaliza a string fornecida pelo usuário:
        _raw = DEFAULT_CONNECTION.strip().strip('"')

        # Se o usuário passou a string sem especificar o Driver ODBC, insere um driver padrão
        # para evitar erros do pyodbc. O valor default aqui usa ODBC Driver 18 quando possível.
        if 'driver=' not in _raw.lower():
            # DB_DRIVER pode vir com ou sem chaves; garantir o nome limpo
            drv = os.getenv('DB_DRIVER', 'ODBC Driver 18 for SQL Server').strip('"{}')
            _raw = f"Driver={{{drv}}};" + _raw

        # Normaliza valores booleanos comuns para a forma esperada pelo driver (yes/no)
        _raw = _raw.replace('Encrypt=True', 'Encrypt=yes').replace('Encrypt=True;', 'Encrypt=yes;')
        _raw = _raw.replace('Encrypt=False', 'Encrypt=no').replace('Encrypt=False;', 'Encrypt=no;')
        _raw = _raw.replace('TrustServerCertificate=True', 'TrustServerCertificate=yes').replace('TrustServerCertificate=True;', 'TrustServerCertificate=yes;')
        _raw = _raw.replace('TrustServerCertificate=False', 'TrustServerCertificate=no').replace('TrustServerCertificate=False;', 'TrustServerCertificate=no;')

        _params = urllib.parse.quote_plus(_raw)
        SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={_params}"
    else:
        if DB_UID:
            # Conexão com Autenticação do SQL Server
            _params = urllib.parse.quote_plus(
                f"Driver={{{DB_DRIVER}}};"
                f"Server={DB_SERVER};"
                f"Database={DB_DATABASE};"
                f"UID={DB_UID};"
                f"PWD={{{DB_PWD}}};"
            )
        else:
            # Conexão com Autenticação do Windows
            _params = urllib.parse.quote_plus(
                f"Driver={{{DB_DRIVER}}};"
                f"Server={DB_SERVER};"
                f"Database={DB_DATABASE};"
                f"Trusted_Connection=yes;"
            )

        SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={_params}"
    
    # Desativa um recurso do SQLAlchemy que emite sinais a cada modificação no banco.
    # Desativar melhora a performance e é a configuração recomendada.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Chave da API do Google Gemini, lida a partir das variáveis de ambiente.
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    # Flag para habilitar o preview Gemini 3 Pro para todos os clientes
    ENABLE_GEMINI_3_PRO_PREVIEW = os.getenv('ENABLE_GEMINI_3_PRO_PREVIEW', '1') == '1'
    # Permite forçar um modelo específico via env (ex: gemini-3.0-pro, gemini-1.5-flash)
    GEMINI_MODEL_OVERRIDE = os.getenv('GEMINI_MODEL_OVERRIDE')

    # --- Configurações de Upload de Arquivos ---
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}

    # --- Flags de desenvolvimento/qualidade ---
    # Quando AUTH_BYPASS=1 (em variável de ambiente) ou via querystring ?bypass=1,
    # o sistema permite navegar por telas protegidas sem sessão (somente para DEV/testes).
    # Por padrão, se DEBUG estiver ligado, habilitamos o bypass para facilitar o desenvolvimento.
    AUTH_BYPASS = os.getenv('AUTH_BYPASS', '1' if DEBUG else '0') == '1'
