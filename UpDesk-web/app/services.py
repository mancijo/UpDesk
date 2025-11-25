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
import re  # Expressões regulares usadas para parsing e limpeza

def init_ia():
    """Inicializa o serviço de IA (Gemini) com a chave de API configurada.

    Define o modelo padrão gemini-1.5-flash salvo em current_app.config['GEMINI_MODEL'],
    permitindo override via GEMINI_MODEL_OVERRIDE.
    """
    gemini_api_key = current_app.config.get("GEMINI_API_KEY")
    if not gemini_api_key:
        current_app.logger.error("ERRO CRÍTICO: GEMINI_API_KEY não definida.")
        return
    try:
        genai.configure(api_key=gemini_api_key)
        override = current_app.config.get('GEMINI_MODEL_OVERRIDE')
        if override:
            current_app.config['GEMINI_MODEL'] = override
            current_app.logger.info(f"Override ativo do modelo Gemini: {override}")
        else:
            current_app.config['GEMINI_MODEL'] = 'gemini-1.5-flash'
            current_app.logger.info("Serviço de IA (Gemini) configurado com sucesso. Modelo: gemini-1.5-flash")
    except Exception as e:
        current_app.logger.error(f"Erro ao configurar Gemini: {e}")
def buscar_solucao_com_ia(titulo, descricao):
    """Consulta a IA para obter uma solução e classificar PRIORIDADE (Baixa|Média|Alta).

    Retorna (solucao_sugerida_raw, prioridade_classificada) ou fallback.
    A solução retorna em texto simples (Markdown permitido) e é convertida em HTML por format_solucao.
    """
    prompt = (
        "Aja como um especialista de suporte técnico de TI (Nível 1). Um usuário descreve:\n"
        f"- Título do Chamado: \"{titulo}\"\n"
        f"- Descrição do Problema: \"{descricao}\"\n\n"
        "Classifique a PRIORIDADE (impacto e urgência) como 'Baixa', 'Média' ou 'Alta'. "
        "Depois forneça passos claros de solução.\n\nFormato obrigatório:\n"
        "Prioridade: [Baixa|Média|Alta]\nSolução: [Solução detalhada em passos]\n"
    )

    max_attempts = 2
    backoff_seconds = 1
    model_id = current_app.config.get('GEMINI_MODEL', 'gemini-1.5-flash')

    for attempt in range(1, max_attempts + 1):
        try:
            model = genai.GenerativeModel(model_id)
            response = model.generate_content(prompt)
            response_text = getattr(response, 'text', '') or ''
            if not response_text.strip():
                raise ValueError('Resposta vazia da IA')

            prioridade_match = re.search(r"(?:Prioridade|Urgência):\s*(Baixa|Média|Alta)", response_text, re.IGNORECASE)
            solucao_match = re.search(r"Solução:\s*(.*)", response_text, re.IGNORECASE | re.DOTALL)
            prioridade_classificada = prioridade_match.group(1).strip().title() if prioridade_match else 'Não Classificada'
            solucao_sugerida = solucao_match.group(1).strip() if solucao_match else response_text
            # Remove bloco inicial que contenha prioridade para evitar duplicação
            solucao_sugerida = re.sub(r"^(?:Prioridade|Urgência):.*?(?:\r?\n)+", "", solucao_sugerida, flags=re.IGNORECASE).strip()
            return solucao_sugerida, prioridade_classificada

        except Exception as e:
            current_app.logger.exception(f"Tentativa {attempt} - erro IA modelo '{model_id}': {e}")
            # Fallbacks específicos
            try:
                if isinstance(e, google_exceptions.ResourceExhausted):
                    if 'flash' not in model_id:
                        current_app.logger.warning("Quota excedida; alternando para gemini-1.5-flash.")
                        current_app.config['GEMINI_MODEL'] = 'gemini-1.5-flash'
                        model_id = 'gemini-1.5-flash'
                        time.sleep(0.6)
                        continue
                    return ("Não foi possível obter sugestão (quota). Prossiga com abertura.", 'Não Classificada')
            except Exception:
                current_app.logger.debug("Falha no fallback de quota.")
            try:
                if isinstance(e, google_exceptions.NotFound):
                    current_app.logger.info("Modelo não encontrado; tentando seleção automática.")
                    try:
                        models = genai.list_models()
                        iterable = getattr(models, 'models', None) or models
                        prefs = ['flash', 'pro']
                        candidates = []
                        for m in iterable:
                            name = getattr(m, 'name', None) if not isinstance(m, dict) else m.get('name')
                            if not name:
                                continue
                            try:
                                methods = getattr(m, 'supported_generation_methods', []) if not isinstance(m, dict) else m.get('supported_generation_methods', [])
                                if 'generateContent' not in methods:
                                    continue
                            except Exception:
                                continue
                            candidates.append(name)
                        def score(n):
                            lower = n.lower()
                            for i, p in enumerate(prefs):
                                if p in lower:
                                    return i
                            return len(prefs)
                        if candidates:
                            candidates.sort(key=score)
                            chosen = candidates[0].split('/',1)[1] if candidates[0].startswith('models/') else candidates[0]
                            current_app.config['GEMINI_MODEL'] = chosen
                            model_id = chosen
                            time.sleep(0.5)
                            continue
                    except Exception as le:
                        current_app.logger.exception(f"Erro ao selecionar modelo: {le}")
            except Exception:
                current_app.logger.debug("Falha ao tratar NotFound.")
            if attempt < max_attempts:
                time.sleep(backoff_seconds * attempt)

    current_app.logger.error("Falha total nas tentativas IA. Usando fallback.")
    return ("Não foi possível obter uma sugestão da IA. Prossiga com a abertura do chamado.", 'Não Classificada')


def format_solucao(text: str) -> str:
    """Converte texto Markdown da solução em HTML sanitizado seguro para renderização."""
    if text is None:
        text = ''
    # Reduz sequências excessivas de asteriscos (evita poluição visual)
    text = re.sub(r"\*{3,}", "**", text)
    try:
        html = markdown.markdown(text, extensions=['extra', 'sane_lists'])
    except Exception:
        html = '<p>' + bleach.clean(text) + '</p>'
    allowed_tags = [
        'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol', 'p', 'pre',
        'strong', 'ul', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ]
    allowed_attrs = {
        '*': ['class'],
        'a': ['href', 'title', 'rel', 'target'],
        'img': ['src', 'alt', 'title'],
    }
    cleaned = bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs, strip=True)
    return cleaned

