# Teste simples de geração com diferentes nomes de modelo
# Executar com o Python do venv do projeto.
import os
from dotenv import load_dotenv
import traceback

ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(ENV_PATH)

import google.generativeai as genai
key = os.getenv('GEMINI_API_KEY')
print('Usando key:', key[:6] + '...' if key else None)

models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5']
for m in models:
    print('\n=== Testando modelo:', m)
    try:
        genai.configure(api_key=key)
    except Exception as e:
        print('configure error:', e)
    try:
        model = genai.GenerativeModel(m)
        resp = model.generate_content('Forneça uma sugestão breve e passo a passo para reiniciar um computador Windows quando um aplicativo trava.')
        # Algumas versões retornam .text, outras possuem structure
        text = getattr(resp, 'text', None)
        if not text:
            # tentar converter para string
            try:
                text = str(resp)
            except Exception:
                text = repr(resp)
        print('Resposta recebida (trunc):', text[:500])
    except Exception as e:
        print('Erro ao gerar com modelo', m)
        traceback.print_exc()

print('\nTeste completo.')
