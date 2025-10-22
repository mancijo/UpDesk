# Script de diagnóstico para a integração com Gemini
# Executar com o Python do virtualenv do projeto.

import os
from dotenv import load_dotenv
import traceback

ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(ENV_PATH)

print('Carregando .env de:', ENV_PATH)
print('GEMINI_API_KEY (raw)=', os.getenv('GEMINI_API_KEY'))

try:
    import importlib.metadata as md
    try:
        ver = md.version('google-generativeai')
    except Exception:
        ver = 'unknown'
except Exception:
    ver = 'unknown'

print('google-generativeai version =', ver)

try:
    import google.generativeai as genai
    print('Import google.generativeai: OK')
    print('Atributos principais de google.generativeai:', [a for a in dir(genai) if not a.startswith('_')][:40])
    try:
        key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=key)
        print('genai.configure: OK')
    except Exception as e:
        print('genai.configure: ERRO')
        traceback.print_exc()
    # Checar existência de GenerativeModel
    print('Possui GenerativeModel?', hasattr(genai, 'GenerativeModel'))
    if hasattr(genai, 'GenerativeModel'):
        try:
            model_cls = genai.GenerativeModel
            print('GenerativeModel repr:', model_cls)
        except Exception:
            traceback.print_exc()
except Exception as e:
    print('Erro ao importar google.generativeai:')
    traceback.print_exc()

print('\nDiagnóstico completo.')
