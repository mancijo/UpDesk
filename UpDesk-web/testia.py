import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential
import os
import time
from dotenv import load_dotenv

load_dotenv()

# --- Importante: Configure sua API Key de forma segura ---
# Recomendo usar variáveis de ambiente. Crie um arquivo .env ou configure no seu sistema.
# Ex: GOOGLE_API_KEY="SUA_API_KEY_AQUI"
# Para carregar de um arquivo .env, instale 'pip install python-dotenv' e use:
# from dotenv import load_dotenv
# load_dotenv()
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Importa a exceção correta da biblioteca do Google
# Este é o erro que corresponde ao "429 ResourceExhausted" ou limite de taxa.
from google.api_core.exceptions import ResourceExhausted

def gerar_conteudo_com_backoff(prompt):
    """
    Esta função chama a API Gemini.
    Se der erro de limite de taxa, ela tentará novamente com um backoff exponencial.
    """
    max_attempts = 5
    base_delay = 2
    for attempt in range(max_attempts):
        try:
            print(f"➡️  Tentando chamar a API (tentativa {attempt + 1}/{max_attempts}) para o prompt: '{prompt[:30]}...'")
            model = genai.GenerativeModel('models/gemini-pro-latest')
            response = model.generate_content(prompt)
            print("✅ Chamada bem-sucedida!")
            return response.text
        except ResourceExhausted as e:
            if attempt < max_attempts - 1:
                delay = base_delay * (2 ** attempt)
                print(f"❌ Limite de taxa atingido. Tentando novamente em {delay} segundos...")
                time.sleep(delay)
            else:
                raise e # Re-lança a exceção se todas as tentativas falharem


# --- EXEMPLO DE USO ---
# Vamos simular que você tem uma lista de tarefas para a IA
prompts_para_processar = [
    "Resuma o conceito de Machine Learning em um parágrafo.",
    "Liste 5 capitais europeias e seus países.",
    "Crie um nome criativo para uma cafeteria com tema de gatos.",
    "Escreva uma linha de código em Python que imprima 'Olá, Mundo!'",
    "Qual a distância da Terra para a Lua?",
    "Sugira 3 ideias de posts para o Instagram de uma loja de moda praia." # Usando seu contexto!
]

# Loop para processar todas as tarefas
for i, prompt in enumerate(prompts_para_processar):
    try:
        print(f"\n--- Processando Tarefa {i+1}/{len(prompts_para_processar)} ---")
        resultado = gerar_conteudo_com_backoff(prompt)
        print(f"💡 Resultado: {resultado}\n")
        
        # Opcional: Adicionar um pequeno atraso fixo entre as chamadas bem-sucedidas
        # para evitar atingir o limite em primeiro lugar.
        time.sleep(1) 

    except Exception as e:
        # Este bloco será executado se, mesmo após 5 tentativas, a API falhar.
        print(f"❌ Falha ao processar o prompt '{prompt[:30]}...' após várias tentativas.")
        print(f"Erro final: {e}")
        # Opcional: você pode decidir parar o loop ou apenas pular para o próximo
        # break
        continue