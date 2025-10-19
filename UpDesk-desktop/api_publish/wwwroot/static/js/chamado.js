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

        const response = await fetch('/api/chamados', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao salvar: ${errorText}`);
        }

        alert('Chamado registrado como resolvido pela IA!');
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
        const response = await fetchWithAuth('/api/ia/sugerir-solucao', {
            method: 'POST',
            body: JSON.stringify({ titulo, descricao })
        });

        if (!response.ok) {
            throw new Error('Falha ao obter sugestão da IA.');
        }

        const data = await response.json();
        solutionText.textContent = data.solucao || 'Nenhuma sugestão disponível no momento.';
        solutionDisplay.classList.remove('d-none');

    } catch (error) {
        console.error('Erro IA:', error);
        alert('Erro ao obter sugestão: ' + error.message);
    } finally {
        suggestBtn.disabled = false;
        suggestBtn.innerHTML = 'Buscar Solução com IA';
    }
}

function hasVowels(str) {
    return /[aeiou]/i.test(str);
}
