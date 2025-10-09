"""
Ponto de Entrada da Aplicação (Entry Point)

Responsabilidade:
- Ser o script principal que é executado para iniciar a aplicação.
- Importar a função de fábrica `create_app` de dentro do pacote `app`.
- Criar a instância da aplicação.
- Iniciar o servidor de desenvolvimento do Flask quando o script é executado diretamente.
"""
from app import create_app

# Chama a função de fábrica para criar e configurar a instância da aplicação Flask.
app = create_app()

# A condição `if __name__ == '__main__':` garante que o código dentro deste bloco
# só será executado quando o script `run.py` for chamado diretamente pelo interpretador Python.
# Isso previne que o servidor inicie caso este arquivo seja importado por outro script.
if __name__ == '__main__':
    # Inicia o servidor de desenvolvimento web do Flask.
    # `debug=True` ativa o modo de depuração, que oferece recarregamento automático
    # a cada alteração no código e um depurador interativo no navegador em caso de erro.
    # O valor é pego do arquivo de configuração para facilitar a mudança entre ambientes.
    app.run(debug=app.config.get('DEBUG', False))
    