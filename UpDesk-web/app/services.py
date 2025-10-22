"""
Arquivo de Serviços

Responsabilidade:
- Conter a lógica de negócio desacoplada das rotas (views).
- Lida com integrações de serviços externos, como a API do Google Gemini.
- Manter este código separado das rotas torna o código dos blueprints mais limpo e focado no fluxo da requisição.
"""
import os
import time
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from flask import current_app
import markdown
import bleach

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

            # Tentar selecionar automaticamente um modelo compatível para generateContent
            try:
                models = genai.list_models()
                iterable = getattr(models, 'models', None) or models
                prefs = ['flash', 'pro', '2.5', '2.0']
                candidates = []
                for m in iterable:
                    name = getattr(m, 'name', None) if not isinstance(m, dict) else m.get('name')
                    if not name:
                        continue
                    # verificar se suporta generateContent
                    supports = False
                    methods = getattr(m, 'supported_generation_methods', None) if not isinstance(m, dict) else m.get('supported_generation_methods')
                    if methods and 'generateContent' in methods:
                        supports = True
                    if supports:
                        candidates.append(name)

                def score(n):
                    lower = n.lower()
                    for i, p in enumerate(prefs):
                        if p in lower:
                            return i
                    return len(prefs)

                if candidates:
                    candidates.sort(key=score)
                    chosen_full = candidates[0]
                    # guardar apenas o identificador após 'models/' se existir
                    chosen = chosen_full.split('/', 1)[1] if chosen_full.startswith('models/') else chosen_full
                    current_app.config['GEMINI_MODEL'] = chosen
                    current_app.logger.info(f"Modelo Gemini selecionado por init_ia: {chosen}")
            except Exception as me:
                current_app.logger.debug(f"Não foi possível auto-selecionar modelo Gemini: {me}")

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
    # Tentativa de chamar a API com retry simples.
    prompt = f"""Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário está relatando o seguinte problema:
    - Título do Chamado: \"{titulo}\"\n    - Descrição do Problema: \"{descricao}\"\n    Forneça uma solução clara e em formato de passo a passo para um usuário final. A resposta deve ser direta e fácil de entender. Se não tiver certeza, sugira coletar mais informações que poderiam ajudar no diagnóstico."""

    # Configurações de retry
    max_attempts = 2
    backoff_seconds = 1

    # model_id pode ser cacheado em config para evitar chamadas repetidas a list_models
    model_id = current_app.config.get('GEMINI_MODEL', 'gemini-pro')

    for attempt in range(1, max_attempts + 1):
        try:
            model = genai.GenerativeModel(model_id)
            response = model.generate_content(prompt)
            # Se tivemos resposta, retornamos o texto
            return response.text
        except Exception as e:
            # Log completo para diagnóstico (stack trace)
            current_app.logger.exception(f"Tentativa {attempt} - erro ao contatar a API do Gemini com modelo '{model_id}': {e}")

            # Tratamento específico para quota excedida (429)
            try:
                if isinstance(e, google_exceptions.ResourceExhausted):
                    current_app.logger.error(
                        "Erro de quota detectado (ResourceExhausted). Verifique quotas da API 'generativelanguage.googleapis.com' no Console do GCP e se o billing/projeto está habilitado."
                    )
                    # Mensagem amigável ao usuário mantendo privacidade da quota
                    return (
                        "Não foi possível obter uma sugestão da IA no momento (limite de uso/quota). "
                        "Por favor, prossiga com a abertura do chamado."
                    )
            except Exception:
                current_app.logger.debug("Falha ao verificar tipo de exceção de quota.")

            # Tratamento para modelo não encontrado: tentar descobrir modelos disponíveis e escolher um compatível
            try:
                if isinstance(e, google_exceptions.NotFound):
                    current_app.logger.info("Modelo configurado não encontrado — consultando modelos disponíveis para selecionar um compatível.")
                    try:
                        models = genai.list_models()
                        chosen = None
                        # models pode ser um iterator/obj com atributo .models
                        iterable = getattr(models, 'models', None) or models
                        # preferências de nome (ordem)
                        prefs = ['pro', 'flash', 'flash-lite', '2.5', '2.0']
                        candidates = []
                        for m in iterable:
                            # tentar extrair nome em formato 'models/xxx'
                            name = None
                            if hasattr(m, 'name'):
                                name = getattr(m, 'name')
                            elif isinstance(m, dict):
                                name = m.get('name')
                            if not name:
                                continue
                            # verificar se suporta generateContent (pode estar em supported_generation_methods)
                            supports = False
                            try:
                                if hasattr(m, 'supported_generation_methods'):
                                    supports = 'generateContent' in getattr(m, 'supported_generation_methods')
                                elif isinstance(m, dict):
                                    methods = m.get('supported_generation_methods')
                                    supports = methods and 'generateContent' in methods
                            except Exception:
                                supports = False
                            if not supports:
                                continue
                            candidates.append(name)

                        # ordenar candidatos por preferência de substring
                        def score(n):
                            lower = n.lower()
                            for i, p in enumerate(prefs):
                                if p in lower:
                                    return i
                            return len(prefs)

                        if candidates:
                            candidates.sort(key=score)
                            # extrair a parte após 'models/' se presente
                            chosen_full = candidates[0]
                            if chosen_full.startswith('models/'):
                                chosen = chosen_full.split('/', 1)[1]
                            else:
                                chosen = chosen_full
                            current_app.config['GEMINI_MODEL'] = chosen
                            current_app.logger.info(f"Modelo escolhido automaticamente: {chosen}")
                            # atualizar model_id e tentar novamente neste mesmo loop (não incrementar attempt)
                            model_id = chosen
                            # pequena pausa antes da nova tentativa
                            time.sleep(0.5)
                            continue
                    except Exception as le:
                        current_app.logger.exception(f"Erro ao listar/selecionar modelos: {le}")
            except Exception:
                current_app.logger.debug("Falha ao verificar tipo de exceção NotFound.")

            if attempt < max_attempts:
                time.sleep(backoff_seconds * attempt)

    # Se chegou aqui, todas as tentativas falharam. Retornar fallback amigável com passos manuais.
    current_app.logger.error("Todas as tentativas para consultar a IA falharam. Usando fallback textual.")
    fallback_message = "Não foi possível obter uma sugestão da IA no momento. Por favor, prossiga com a abertura do chamado.\n"
    return fallback_message


def format_solucao(solucao_texto: str) -> str:
    """Formata a solução retornada pela IA em HTML seguro.

    - Converte Markdown (ou texto com **negritos**, listas, etc.) para HTML.
    - Sanitiza o HTML resultante com bleach para evitar XSS.

    Retorna uma string HTML segura pronta para ser inserida no template com |safe.
    """
    if not solucao_texto:
        return ""

    # Normalizar quebras de linha
    text = solucao_texto.replace('\r\n', '\n').replace('\r', '\n')

    # Alguns outputs trazem muitos asteriscos ou espaços; remover repetições estranhas
    # Substitui três ou mais asteriscos por dois (Markdown ainda tratará como ênfase)
    import re
    text = re.sub(r"\*{3,}", "**", text)

    # Converter Markdown para HTML (extensão extra para listas e tables)
    try:
        html = markdown.markdown(text, extensions=['extra', 'sane_lists'])
    except Exception:
        # fallback simples: escapar e envolver em <p>
        html = '<p>' + bleach.clean(text) + '</p>'

    # Sanitizar o HTML gerado permitindo tags comuns
    allowed_tags = [
        'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 'p', 'pre',
        'strong', 'ul', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ]
    allowed_attrs = {
        '*': ['class'],
        'a': ['href', 'title', 'rel', 'target'],
        'img': ['src', 'alt', 'title'],
    }

    clean_html = bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs)
    # Transformar URLs em links clicáveis (linkify)
    clean_html = bleach.linkify(clean_html)

    return clean_html

