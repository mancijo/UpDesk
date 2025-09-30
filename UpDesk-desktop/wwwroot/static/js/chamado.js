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
            // Simula o clique no botão de submit original para reaproveitar a lógica
            chamadoForm.querySelector('button[type="submit"]').click();
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

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    errorMessageDiv.classList.add('d-none');

    const formData = new FormData(form);
    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${apiUrl}/api/chamados`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        if (response.ok) {
            alert('Chamado aberto com sucesso!');
            window.location.href = '/templates/verChamado.html';
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Ocorreu um erro ao abrir o chamado.' }));
            throw new Error(errorData.message || 'Erro desconhecido.');
        }
    } catch (error) {
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.classList.remove('d-none');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Abrir Chamado';
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