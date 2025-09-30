# gerar_hash.py
from werkzeug.security import generate_password_hash
import getpass

# Pede para o usuário digitar a nova senha de forma segura
nova_senha = getpass.getpass("Digite a nova senha para o usuário: ")

# Gera o hash da senha
hash_da_senha = generate_password_hash(nova_senha)

# Imprime o hash gerado
print(hash_da_senha)


