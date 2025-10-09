"""
Arquivo de Serviços

Responsabilidade:
- Conter a lógica de negócio desacoplada das rotas (views).
- Lida com integrações de serviços externos, como a API do Google Gemini.
- Manter este código separado das rotas torna o código dos blueprints mais limpo e focado no fluxo da requisição.
"""
import os
import google.generativeai as genai
from flask import current_app

def init_ia():
    """
    Inicializa o serviço de IA (Google Gemini) com a chave da API.
    Esta função é chamada uma vez na inicialização da aplicação (em app/__init__.py).
    """
    # Busca a chave da API a partir das configurações da aplicação Flask
    gemini_api_key = current_app.config.get("GEMINI_API_KEY")
    
    # Verifica se a chave foi encontrada e loga um erro crítico caso contrário
    if not gemini_api_key:
        current_app.logger.error("ERRO CRÍTICO: A variável de ambiente 'GEMINI_API_KEY' não foi encontrada.")
    else:
        try:
            # Configura a biblioteca do Google com a chave da API
            genai.configure(api_key=gemini_api_key)
            current_app.logger.info("Serviço de IA (Gemini) configurado com sucesso.")
        except Exception as e:
            current_app.logger.error(f"Erro ao configurar a API do Gemini: {e}")

def buscar_solucao_com_ia(titulo, descricao):
    """
    Busca uma solução para um problema técnico usando a API do Google Gemini.
    
    Args:
        titulo (str): O título do chamado.
        descricao (str): A descrição do problema.
        
    Returns:
        str: A solução sugerida pela IA ou uma mensagem de erro.
    """
    try:
        # Seleciona o modelo generativo a ser usado
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        # Constrói o prompt que será enviado para a IA. 
        # O prompt é cuidadosamente elaborado para dar um contexto à IA (agir como suporte N1)
        # e formatar a pergunta do usuário.
        prompt = f"""Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário está relatando o seguinte problema:
        - Título do Chamado: \"{titulo}\"\n        - Descrição do Problema: \"{descricao}\"\n        Forneça uma solução clara e em formato de passo a passo para um usuário final. A resposta deve ser direta e fácil de entender. Se não tiver certeza, sugira coletar mais informações que poderiam ajudar no diagnóstico."""
        
        # Envia o prompt para a IA e aguarda a resposta
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        # Em caso de erro na comunicação com a API, loga o erro e retorna uma mensagem amigável.
        current_app.logger.error(f"Erro ao contatar a API do Gemini: {e}")
        return "Não foi possível obter uma sugestão da IA no momento. Por favor, prossiga com a abertura do chamado."

