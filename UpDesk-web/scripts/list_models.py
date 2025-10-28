# Lista modelos disponíveis na API Generative Language para a chave configurada
import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(ENV_PATH)

key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
print('Usando GEMINI/API key:', 'set' if key else 'not set')
if not key:
    raise SystemExit('Nenhuma chave encontrada em GEMINI_API_KEY ou GOOGLE_API_KEY')

genai.configure(api_key=key)

try:
    models = genai.list_models()
    # models pode ser um objeto complexo; tentar imprimir nome e supported_methods
    results = []
    for m in getattr(models, 'models', []) or models:
        # tentar atributos comuns
        name = getattr(m, 'name', None) or m.get('name') if isinstance(m, dict) else str(m)
        try:
            methods = getattr(m, 'supported_methods', None) or m.get('supported_methods')
        except Exception:
            methods = None
        results.append({'name': name, 'supported_methods': methods})
    print(json.dumps(results, indent=2, ensure_ascii=False))
except Exception as e:
    import traceback
    print('Erro ao listar modelos:')
    traceback.print_exc()
