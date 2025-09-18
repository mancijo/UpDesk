import os
import google.generativeai as genai
from flask import current_app

def init_ia():
    """Inicializa o serviço de IA com a chave da API."""
    gemini_api_key = current_app.config.get("GEMINI_API_KEY")
    if not gemini_api_key:
        current_app.logger.error("ERRO CRÍTICO: A variável de ambiente 'GEMINI_API_KEY' não foi encontrada.")
    else:
        try:
            genai.configure(api_key=gemini_api_key)
            current_app.logger.info("Serviço de IA (Gemini) configurado com sucesso.")
        except Exception as e:
            current_app.logger.error(f"Erro ao configurar a API do Gemini: {e}")

def buscar_solucao_com_ia(titulo, descricao):
    """
    Busca uma solução para um problema técnico usando a API do Google Gemini.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        prompt = f"""Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário está relatando o seguinte problema:
        - Título do Chamado: \"{titulo}\"\n        - Descrição do Problema: \"{descricao}\"\n        Forneça uma solução clara e em formato de passo a passo para um usuário final. A resposta deve ser direta e fácil de entender. Se não tiver certeza, sugira coletar mais informações que poderiam ajudar no diagnóstico."""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        current_app.logger.error(f"Erro ao contatar a API do Gemini: {e}")
        return "Não foi possível obter uma sugestão da IA no momento. Por favor, prossiga com a abertura do chamado."

