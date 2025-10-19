"""
Script Utilitário para Geração de Hash de Senha

Responsabilidade:
- Fornecer uma forma segura de gerar um hash de senha a partir de uma entrada de texto no terminal.
- Útil para criar senhas para usuários inseridos manualmente no banco de dados ou para scripts de seed.
- NÃO faz parte da aplicação web principal, é uma ferramenta para o desenvolvedor.
"""
from werkzeug.security import generate_password_hash
import getpass

# `getpass.getpass` solicita a senha ao usuário sem exibi-la no terminal, por segurança.
nova_senha = getpass.getpass("Digite a nova senha para gerar o hash: ")

# Usa a função `generate_password_hash` do Werkzeug para criar um hash seguro e "salgado" (salted).
# O mesmo algoritmo usado na aplicação (`usuarios.py`).
hash_da_senha = generate_password_hash(nova_senha)

<<<<<<< HEAD
# Imprime o hash gerado
print(hash_da_senha)

=======
# Imprime o hash resultante no console para que o desenvolvedor possa copiá-lo.
print("\n--- HASH GERADO ---")
print(hash_da_senha)
print("--- Copie a linha acima para usar no seu script SQL ou para atualizar o banco de dados ---\
")
>>>>>>> d82b71defb868dcbfd244450643bece347d1141a

