// /static/js/chamado.js

document.addEventListener('DOMContentLoaded', () => {
    const chamadoForm = document.getElementById('chamado-form');
    const suggestBtn = document.getElementById('suggest-solution-btn');
    const forceCreateBtn = document.getElementById('force-create-ticket-btn');

    if (chamadoForm) {
        chamadoForm.addEventListener('submit', handleFormSubmit);
    }
    if (suggestBtn) {
        suggestBtn.addEventListener('click', getAISuggestion);
    }
    if(forceCreateBtn) {
        forceCreateBtn.addEventListener('click', () => {
            document.getElementById('submit-chamado').click();
        });
    }
});

/**
 * Manipula o envio final do formulário para criar um chamado.
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const errorMessageDiv = document.getElementById('error-message');

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;

    if (titulo.toLowerCase().trim() === 'comeram minha marmita') {
        alert('Isso não é uma categoria de chamado, fale com seu supervisor');
        return;
    }

    if (titulo.length < 10) {
        errorMessageDiv.textContent = 'O título deve ter no mínimo 10 caracteres.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (descricao.length < 20) {
        errorMessageDiv.textContent = 'A descrição deve ter no mínimo 20 caracteres.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (titulo.toLowerCase().trim() === 'teste') {
        errorMessageDiv.textContent = 'O título não pode ser "Teste". Por favor, forneça um título mais descritivo.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (descricao.toLowerCase().trim() === 'teste') {
        errorMessageDiv.textContent = 'A descrição não pode ser "Teste". Por favor, forneça uma descrição mais detalhada.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (!hasVowels(titulo)) {
        errorMessageDiv.textContent = 'O título parece ser inválido. Por favor, verifique.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (!hasVowels(descricao)) {
        errorMessageDiv.textContent = 'A descrição parece ser inválida. Por favor, verifique.';
        errorMessageDiv.classList.remove('d-none');
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
    }
    errorMessageDiv.classList.add('d-none');

    // Manually construct the DTO to ensure correct property names (PascalCase)
    const payload = {
        Titulo: document.getElementById('titulo').value,
        Descricao: document.getElementById('descricao').value,
        Categoria: document.getElementById('categoria').value,
        Prioridade: document.getElementById('prioridade').value,
        SolicitanteId: null,
    };

    try {
        const userInfo = JSON.parse(localStorage.getItem('usuario'));
        // CORREÇÃO: Verifica por 'id' (camelCase) e 'Id' (PascalCase) para ser robusto.
        const userId = userInfo ? (userInfo.id || userInfo.Id) : null;
        if (userId) {
            payload.SolicitanteId = parseInt(userId, 10);
        }
    } catch (e) {
        console.error('Erro ao ler usuario do localStorage:', e);
    }

    if (!payload.SolicitanteId) {
        errorMessageDiv.textContent = 'Não foi possível identificar o usuário solicitante. Faça o login novamente.';
        errorMessageDiv.classList.remove('d-none');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Abrir Chamado';
        }
        return;
    }

    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${apiUrl}/api/chamados`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert('Chamado aberto com sucesso!');
            window.location.href = '/templates/verChamado.html';
        } else {
            const errorText = await response.text();
            const detailedError = `Status: ${response.status} ${response.statusText}. Response: ${errorText}`;
            throw new Error(detailedError);
        }
    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.classList.remove('d-none');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Abrir Chamado';
        }
    }
}

/**
 * Busca uma sugestão da IA com base no título e descrição.
 */
async function getAISuggestion() {
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const suggestBtn = document.getElementById('suggest-solution-btn');
    const solutionDisplay = document.getElementById('solution-display');
    const solutionText = document.getElementById('solution-text');

    if (titulo.toLowerCase().trim() === 'comeram minha marmita') {
        alert('Isso não é uma categoria de chamado, fale com seu supervisor');
        return;
    }

    if (titulo.length < 10) {
        alert('O título deve ter no mínimo 10 caracteres.');
        return;
    }

    if (descricao.length < 20) {
        alert('A descrição deve ter no mínimo 20 caracteres.');
        return;
    }

    if (titulo.toLowerCase().trim() === 'teste') {
        alert('O título não pode ser "Teste". Por favor, forneça um título mais descritivo.');
        return;
    }

    if (descricao.toLowerCase().trim() === 'teste') {
        alert('A descrição não pode ser "Teste". Por favor, forneça uma descrição mais detalhada.');
        return;
    }

    if (!hasVowels(titulo)) {
        alert('O título parece ser inválido. Por favor, verifique.');
        return;
    }

    if (!hasVowels(descricao)) {
        alert('A descrição parece ser inválida. Por favor, verifique.');
        return;
    }

    if (!titulo || !descricao) {
        alert('Por favor, preencha o título e a descrição antes de pedir uma sugestão.');
        return;
    }

    suggestBtn.disabled = true;
    suggestBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';
    solutionDisplay.classList.add('d-none');

    try {
        // ATENÇÃO: Crie o endpoint POST /api/ia/sugerir-solucao no backend.
        const response = await fetchWithAuth(`${apiUrl}/api/ia/sugerir-solucao`, {
            method: 'POST',
            body: JSON.stringify({ titulo, descricao })
        });

        if (!response.ok) {
            throw new Error('Não foi possível obter uma sugestão da IA.');
        }

        const data = await response.json();
        solutionText.textContent = data.solucao || 'Nenhuma sugestão disponível.';
        solutionDisplay.classList.remove('d-none');

    } catch (error) {
        console.error('Erro ao buscar sugestão da IA:', error);
        alert(error.message);
    } finally {
        suggestBtn.disabled = false;
        suggestBtn.innerHTML = 'Sugerir Solução com IA';
    }
}

function hasVowels(str) {
    return /[aeiou]/i.test(str);
}