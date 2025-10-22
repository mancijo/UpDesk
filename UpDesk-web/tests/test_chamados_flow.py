import sys
import os
import pytest

# Garantir que o diretório do pacote 'app' esteja no sys.path quando o script
# for executado diretamente (facilita execução local sem instalar o pacote).
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import create_app
from app.services import buscar_solucao_com_ia
from unittest.mock import patch


def run_test():
    app = create_app()
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['TESTING'] = True

    with app.test_client() as client:
        # criar contexto e injetar sessão
        with client.session_transaction() as sess:
            sess['usuario_id'] = 1
            sess['usuario_nome'] = 'Teste'

        # Mockar a função de IA para retornar texto previsível
        with patch('app.services.buscar_solucao_com_ia', return_value='Passo 1: Teste. Passo 2: OK'):
            data = {
                'titulo': 'Teste de integração',
                'descricao': 'Descrição suficientemente longa para passar validação',
                'afetado': 'Eu',
                'prioridade': 'Baixa'
            }
            response = client.post('/chamados/abrir', data=data, follow_redirects=True)
            print('STATUS', response.status_code)
            assert response.status_code == 200
            html = response.get_data(as_text=True)
            assert 'Solução Sugerida' in html or 'Solução Sugerida' in html or 'Passo 1' in html
            print('HTML snippet:', html[:400])


if __name__ == '__main__':
    run_test()
