"""
Ponto de Entrada da Aplicação (Entry Point)

Responsabilidade:
- Ser o script principal que é executado para iniciar a aplicação.
- Importar a função de fábrica `create_app` de dentro do pacote `app`.
- Criar a instância da aplicação.
- Iniciar o servidor de desenvolvimento do Flask quando o script é executado diretamente.
"""
from app import create_app

# Cria e configura a instância da aplicação Flask via função de fábrica
app = create_app()

# Executa o servidor de desenvolvimento quando chamado diretamente
if __name__ == '__main__':
    app.run(
        debug=app.config.get('DEBUG', False),
        host='0.0.0.0',
        port=5000,
    )   
   
   


   