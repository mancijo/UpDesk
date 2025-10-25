// /static/js/chamado.js

document.addEventListener('DOMContentLoaded', () => {
    const chamadoForm = document.getElementById('chamado-form');
    const suggestBtn = document.getElementById('suggest-solution-btn');
    const forceCreateBtn = document.getElementById('force-create-ticket-btn');
    const solutionWorkedBtn = document.getElementById('solution-worked-btn');

    if (chamadoForm) {
        chamadoForm.addEventListener('submit', handleFormSubmit);
    }
    if (suggestBtn) {
        suggestBtn.addEventListener('click', getAISuggestion);
    }
    if (forceCreateBtn) {
        forceCreateBtn.addEventListener('click', () => {
            document.getElementById('submit-chamado').click();
        });
    }
    if (solutionWorkedBtn) {
        solutionWorkedBtn.addEventListener('click', handleSolutionWorked);
    }
});

/**
 * Quando o usuário clica em "Sim, problema resolvido!"
 * cria um chamado com status "Resolvido por IA"
 */
async function handleSolutionWorked() {
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const categoria = document.getElementById('categoria').value;
    const prioridade = document.getElementById('prioridade').value;
    const solutionText = document.getElementById('solution-text').textContent.trim();

    const userInfo = JSON.parse(localStorage.getItem('usuario'));
    const userId = userInfo ? (userInfo.id || userInfo.Id) : null;

    if (!userId) {
        alert('Não foi possível identificar o usuário. Faça login novamente.');
        return;
    }

    const payload = {
        Titulo: titulo,
        Descricao: descricao,
        Categoria: categoria,
        Prioridade: prioridade,
        SolicitanteId: parseInt(userId),
        Status: "Resolvido por IA",
        Solucao: solutionText
    };

    try {
        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Mostrar feedback ao usuário enquanto processamos
        showLoading('Finalizando seu chamado...');

        // Cria o chamado primeiro (API sempre cria como 'Aberto')
        const response = await fetch('/api/chamados', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar: ${errorText}`);
        }

        const created = await response.json();
        // procurar o id retornado (variações de casing)
        const chamadoId = created?.ChamadoId ?? created?.chamadoId ?? created?.Id ?? created?.id;
        if (!chamadoId) {
            hideLoading();
            alert('Chamado criado, mas não foi possível identificar o ID para marcar como resolvido.');
            window.location.href = '/templates/verChamado.html';
            return;
        }

        // Agora chama o endpoint para resolver com IA
        const resolverResp = await fetch(`/api/chamados/${chamadoId}/resolver-com-ia`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ Solucao: solutionText })
        });

        if (!resolverResp.ok) {
            const err = await resolverResp.text();
            throw new Error(`Chamado criado (id=${chamadoId}) mas falha ao marcar como resolvido: ${err}`);
        }

        hideLoading();
        alert('Chamado registrado e marcado como resolvido pela IA!');
        window.location.href = '/templates/verChamado.html';

    } catch (error) {
        console.error('Erro ao resolver com IA:', error);
        alert('Erro ao registrar chamado resolvido: ' + error.message);
    }
}

/**
 * Manipula o envio do formulário (abrir chamado normal)
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessageDiv = document.getElementById('error-message');

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;

    if (titulo.length < 10) {
        showError('O título deve ter no mínimo 10 caracteres.');
        return;
    }
    if (descricao.length < 20) {
        showError('A descrição deve ter no mínimo 20 caracteres.');
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
    }

    const payload = {
        Titulo: titulo,
        Descricao: descricao,
        Categoria: document.getElementById('categoria').value,
        Prioridade: document.getElementById('prioridade').value,
        SolicitanteId: null,
    };

    try {
        const userInfo = JSON.parse(localStorage.getItem('usuario'));
        const userId = userInfo ? (userInfo.id || userInfo.Id) : null;
        if (userId) payload.SolicitanteId = parseInt(userId, 10);
    } catch {
        showError('Erro ao identificar usuário.');
        return;
    }

    if (!payload.SolicitanteId) {
        showError('Usuário não identificado. Faça login novamente.');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/chamados`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Chamado aberto com sucesso!');
            window.location.href = '/templates/verChamado.html';
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Abrir Chamado';
        }
    }

    function showError(msg) {
        errorMessageDiv.textContent = msg;
        errorMessageDiv.classList.remove('d-none');
    }
}

/**
 * Busca uma sugestão da IA (Gemini API)
 */
async function getAISuggestion() {
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const suggestBtn = document.getElementById('suggest-solution-btn');
    const solutionDisplay = document.getElementById('solution-display');
    const solutionText = document.getElementById('solution-text');

    if (!titulo || !descricao) {
        alert('Preencha título e descrição antes de buscar sugestão.');
        return;
    }

    suggestBtn.disabled = true;
    suggestBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';
    solutionDisplay.classList.add('d-none');

    try {
        // Envia com as chaves capitalizadas para casar com o DTO do servidor
        showLoading('Buscando solução com IA...');
        // Envia a requisição para a IA
        const response = await fetchWithAuth('/api/ia/sugerir-solucao', {
            method: 'POST',
            body: { Titulo: titulo, Descricao: descricao }
        });

        if (!response.ok) {
            throw new Error('Falha ao obter sugestão da IA.');
        }

        const data = await response.json();
        const raw = data.solucao || 'Nenhuma sugestão disponível no momento.';
        // Renderiza um subconjunto de Markdown com segurança (escape + conversões simples)
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function renderMarkdown(md) {
            const escaped = escapeHtml(md);
            const lines = escaped.split(/\r?\n/);
            let html = '';
            let inOrdered = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) {
                    // blank line -> close lists
                    if (inOrdered) { html += '</ol>'; inOrdered = false; }
                    html += '<p></p>';
                    continue;
                }

                // headings: ## , ###
                if (line.startsWith('### ')) { html += '<h3>' + line.substring(4) + '</h3>'; continue; }
                if (line.startsWith('## ')) { html += '<h2>' + line.substring(3) + '</h2>'; continue; }

                // blockquote starting with >
                if (line.startsWith('> ')) { html += '<blockquote>' + line.substring(2) + '</blockquote>'; continue; }

                // ordered list item like '1. ' or '2. '
                const olMatch = line.match(/^\d+\.\s+(.*)$/);
                if (olMatch) {
                    if (!inOrdered) { html += '<ol>'; inOrdered = true; }
                    html += '<li>' + olMatch[1] + '</li>';
                    continue;
                }

                // bold **text**
                const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // simple inline code `code`
                const code = bold.replace(/`([^`]+)`/g, '<code>$1</code>');

                html += '<p>' + code + '</p>';
            }

            if (inOrdered) html += '</ol>';
            return html;
        }

        // Use marked + DOMPurify for robust markdown -> safe HTML
        try {
            const html = marked.parse(raw);
            const clean = DOMPurify.sanitize(html);
            solutionText.innerHTML = clean;
        } catch (e) {
            // Fallback to previous renderer
            solutionText.innerHTML = renderMarkdown(raw);
        }
        solutionDisplay.classList.remove('d-none');

    } catch (error) {
        console.error('Erro IA:', error);
        alert('Erro ao obter sugestão: ' + error.message);
    } finally {
        hideLoading();
        suggestBtn.disabled = false;
        suggestBtn.innerHTML = 'Buscar Solução com IA';
    }
}

function hasVowels(str) {
    return /[aeiou]/i.test(str);
}
