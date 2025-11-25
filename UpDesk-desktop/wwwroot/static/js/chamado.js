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
            // mais robusto: usa requestSubmit() ou procura o botão de submit no form
            const form = document.getElementById('chamado-form');
            if (form) {
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else {
                    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitBtn) submitBtn.click();
                }
            } else {
                const submit = document.getElementById('submit-chamado');
                if (submit) submit.click();
            }
        });
    }
    if (solutionWorkedBtn) {
        solutionWorkedBtn.addEventListener('click', handleSolutionWorked);
    }

    // Delegation fallback: captura cliques mesmo que os botões sejam adicionados dinamicamente
    document.addEventListener('click', (e) => {
        const el = e.target.closest && e.target.closest('[data-action], #solution-worked-btn, #force-create-ticket-btn, #suggest-solution-btn');
        if (!el) return;

        // "Sim, problema resolvido"
        if (el.id === 'solution-worked-btn' || el.dataset.action === 'solution-worked') {
            e.preventDefault();
            handleSolutionWorked();
            return;
        }

        // "Não, quero abrir um chamado"
        if (el.id === 'force-create-ticket-btn' || el.dataset.action === 'force-create-ticket') {
            e.preventDefault();
            const form = document.getElementById('chamado-form');
            if (form) {
                if (typeof form.requestSubmit === 'function') form.requestSubmit();
                else {
                    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                    if (submitBtn) submitBtn.click();
                }
            } else {
                const submit = document.getElementById('submit-chamado');
                if (submit) submit.click();
            }
            return;
        }

        // botão de sugestão IA (fallback)
        if (el.id === 'suggest-solution-btn' || el.dataset.action === 'suggest-solution') {
            e.preventDefault();
            getAISuggestion();
            return;
        }
    });
});

/* UI feedback helpers: global loading overlay with spinner + message */
function showLoading(message) {
    let el = document.getElementById('global-loading');
    if (!el) {
        el = document.createElement('div');
        el.id = 'global-loading';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        Object.assign(el.style, {
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        });

        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-light';
        spinner.style.width = '1.2rem';
        spinner.style.height = '1.2rem';
        spinner.setAttribute('role', 'status');
        const sr = document.createElement('span');
        sr.className = 'visually-hidden';
        sr.textContent = 'Carregando...';
        spinner.appendChild(sr);

        const msg = document.createElement('div');
        msg.id = 'global-loading-message';
        msg.style.fontSize = '0.95rem';

        el.appendChild(spinner);
        el.appendChild(msg);
        document.body.appendChild(el);
    }
    const msgEl = document.getElementById('global-loading-message');
    if (msgEl) msgEl.textContent = message || '';
    el.style.display = 'flex';
}

function hideLoading() {
    const el = document.getElementById('global-loading');
    if (el) el.style.display = 'none';
}

/**
 * Quando o usuário clica em "Sim, problema resolvido!"
 * cria um chamado com status "Resolvido por IA"
 */
async function handleSolutionWorked() {
	// --- NOVO: utilitários para localizar campos de forma resiliente ---
	const form = document.getElementById('chamado-form');

	function findField(id, nameFallback) {
		// tenta por id global
		let el = document.getElementById(id);
		if (el) return el;

		// tenta dentro do form por id ou name
		if (form) {
			el = form.querySelector(`#${id}`);
			if (el) return el;
			el = form.querySelector(`[name="${nameFallback || id}"]`);
			if (el) return el;
		}

		// tenta global por name
		el = document.querySelector(`[name="${nameFallback || id}"]`);
		if (el) return el;

		// tenta por data-attribute comum
		el = document.querySelector(`[data-field="${id}"], [data-field="${nameFallback || id}"]`);
		return el;
	}

	function getValueFromField(fieldEl) {
		if (!fieldEl) return '';
		if ('value' in fieldEl) return fieldEl.value;
		return fieldEl.textContent || '';
	}

	// procura os elementos com fallback flexível
	const tituloEl = findField('titulo', 'Titulo') || findField('title', 'title');
	const descricaoEl = findField('descricao', 'Descricao') || findField('description', 'description');
	const categoriaEl = findField('categoria', 'Categoria') || findField('category', 'category');
	const prioridadeEl = findField('prioridade', 'Prioridade') || findField('priority', 'priority');

	// solução pode estar em #solution-text, .solution-text ou [data-solution]
	let solutionTextEl = document.getElementById('solution-text')
		|| document.querySelector('.solution-text')
		|| document.querySelector('[data-solution]')
		|| (form && form.querySelector('.solution-text'));

	// Se não encontrou, tenta elementos que contenham a palavra "sol" no id (heurística)
	if (!solutionTextEl) {
		solutionTextEl = Array.from(document.querySelectorAll('[id]')).find(e => /sol/i.test(e.id));
	}

	// validações específicas para ajudar o diagnóstico
	const missing = [];
	if (!tituloEl) missing.push('título');
	if (!descricaoEl) missing.push('descrição');
	if (!prioridadeEl) missing.push('prioridade');
	if (!solutionTextEl) missing.push('texto da solução (IA)');

	if (missing.length) {
		alert(`Campo(s) não encontrados: ${missing.join(', ')}. Recarregue a página e verifique o HTML (ids/names).`);
		return;
	}

	const titulo = getValueFromField(tituloEl).trim();
	const descricao = getValueFromField(descricaoEl).trim();
	const categoria = getValueFromField(categoriaEl).trim();
	const prioridade = getValueFromField(prioridadeEl).trim();
	const solutionText = (solutionTextEl.textContent || solutionTextEl.value || '').trim();

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

    // Resilient field finding
    function findField(id, nameFallback) {
        let el = document.getElementById(id);
        if (el) return el;
        if (form) {
            el = form.querySelector(`#${id}`);
            if (el) return el;
            el = form.querySelector(`[name="${nameFallback || id}"]`);
            if (el) return el;
        }
        el = document.querySelector(`[name="${nameFallback || id}"]`);
        if (el) return el;
        el = document.querySelector(`[data-field="${id}"], [data-field="${nameFallback || id}"]`);
        return el;
    }

    function getValueFromField(fieldEl) {
        if (!fieldEl) return '';
        if ('value' in fieldEl) return fieldEl.value;
        return fieldEl.textContent || '';
    }

    const tituloEl = findField('titulo', 'Titulo') || findField('title', 'title');
    const descricaoEl = findField('descricao', 'Descricao') || findField('description', 'description');
    const categoriaEl = findField('categoria', 'Categoria') || findField('category', 'category');
    const prioridadeEl = findField('prioridade', 'Prioridade') || findField('priority', 'priority');

    // Validate all fields exist
    const missing = [];
    if (!tituloEl) missing.push('título');
    if (!descricaoEl) missing.push('descrição');
    if (!prioridadeEl) missing.push('prioridade');

    if (missing.length) {
        showError(`Campo(s) não encontrados: ${missing.join(', ')}. Verifique o HTML (ids/names).`);
        return;
    }

    const titulo = getValueFromField(tituloEl).trim();
    const descricao = getValueFromField(descricaoEl).trim();

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
        Categoria: getValueFromField(categoriaEl),
        Prioridade: getValueFromField(prioridadeEl),
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
        // Show global feedback while submitting the ticket
        showLoading('Seu chamado está sendo enviado para um técnico...');
        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/chamados`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            hideLoading();
            alert('Chamado aberto com sucesso!');
            window.location.href = '/templates/verChamado.html';
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Abrir Chamado';
        }
    }

    function showError(msg) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = msg;
            errorMessageDiv.classList.remove('d-none');
        } else {
            alert(msg);
        }
    }
}

// Shared utility functions for resilient field finding
function findField(id, nameFallback) {
    const form = document.getElementById('chamado-form');
    let el = document.getElementById(id);
    if (el) return el;
    if (form) {
        el = form.querySelector(`#${id}`);
        if (el) return el;
        el = form.querySelector(`[name="${nameFallback || id}"]`);
        if (el) return el;
    }
    el = document.querySelector(`[name="${nameFallback || id}"]`);
    if (el) return el;
    el = document.querySelector(`[data-field="${id}"], [data-field="${nameFallback || id}"]`);
    return el;
}

function getValueFromField(fieldEl) {
    if (!fieldEl) return '';
    if ('value' in fieldEl) return fieldEl.value;
    return fieldEl.textContent || '';
}

/**
 * Busca uma sugestão da IA (Gemini API)
 */
async function getAISuggestion() {
    const tituloEl = findField('titulo', 'Titulo') || findField('title', 'title');
    const descricaoEl = findField('descricao', 'Descricao') || findField('description', 'description');
    
    const titulo = getValueFromField(tituloEl).trim();
    const descricao = getValueFromField(descricaoEl).trim();
    
    const suggestBtn = document.getElementById('suggest-solution-btn');
    const solutionDisplay = document.getElementById('solution-display');
    const solutionText = document.getElementById('solution-text');

    if (!titulo || !descricao) {
        alert('Preencha título e descrição antes de buscar sugestão.');
        return;
    }

    if (suggestBtn) {
        suggestBtn.disabled = true;
        suggestBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';
    }
    if (solutionDisplay) solutionDisplay.classList.add('d-none');

    try {
        showLoading('Buscando solução com IA...');

        // Construir headers e body JSON corretamente
        const token = localStorage.getItem('authToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/ia/sugerir-solucao', {
            method: 'POST',
            headers,
            body: JSON.stringify({ Titulo: titulo, Descricao: descricao })
        });

        if (!response.ok) {
            // tenta extrair mensagem do corpo para diagnóstico
            let errText = '';
            try { errText = await response.text(); } catch {}
            throw new Error(errText || 'Falha ao obter sugestão da IA.');
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
                    if (inOrdered) { html += '</ol>'; inOrdered = false; }
                    html += '<p></p>';
                    continue;
                }

                if (line.startsWith('### ')) { html += '<h3>' + line.substring(4) + '</h3>'; continue; }
                if (line.startsWith('## ')) { html += '<h2>' + line.substring(3) + '</h2>'; continue; }
                if (line.startsWith('> ')) { html += '<blockquote>' + line.substring(2) + '</blockquote>'; continue; }

                const olMatch = line.match(/^\d+\.\s+(.*)$/);
                if (olMatch) {
                    if (!inOrdered) { html += '<ol>'; inOrdered = true; }
                    html += '<li>' + olMatch[1] + '</li>';
                    continue;
                }

                const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                const code = bold.replace(/`([^`]+)`/g, '<code>$1</code>');
                html += '<p>' + code + '</p>';
            }

            if (inOrdered) html += '</ol>';
            return html;
        }

        try {
            const html = marked.parse(raw);
            const clean = DOMPurify.sanitize(html);
            if (solutionText) solutionText.innerHTML = clean;
        } catch (e) {
            if (solutionText) solutionText.innerHTML = renderMarkdown(raw);
        }
        if (solutionDisplay) solutionDisplay.classList.remove('d-none');

    } catch (error) {
        console.error('Erro IA:', error);
        alert('Erro ao obter sugestão: ' + (error.message || error));
    } finally {
        hideLoading();
        if (suggestBtn) {
            suggestBtn.disabled = false;
            suggestBtn.innerHTML = 'Buscar Solução com IA';
        }
    }
}

function hasVowels(str) {
    return /[aeiou]/i.test(str);
}
