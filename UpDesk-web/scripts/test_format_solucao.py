import os, sys
this_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(this_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.services import format_solucao

raw = '''Olá! Entendo que você está com dificuldade para **abrir o chamado**. *****
1. Tente reiniciar.
2. Limpe cache.

**Passos detalhados:**
- Primeiro faça X
- Depois faça Y

Se ainda não funcionar, envie print(s).'''

html = format_solucao(raw)
print('Formatted HTML snippet:\n')
print(html)
