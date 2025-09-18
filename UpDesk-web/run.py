from app import create_app

# Cria a instância da aplicação a partir da factory
app = create_app()

if __name__ == '__main__':
    # Executa a aplicação
    # O modo debug é pego da configuração, tornando-o mais seguro
    app.run(debug=app.config.get('DEBUG', False))