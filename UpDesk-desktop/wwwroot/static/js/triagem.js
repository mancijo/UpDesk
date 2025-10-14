// /static/js/triagem.js

let transferModal;

document.addEventListener('DOMContentLoaded', () => {
    // Reutiliza o modal de visualização que pode já estar em uso por outros scripts
    const detailsModal = document.getElementById('visualizarChamadoModal');
    transferModal = new bootstrap.Modal(document.getElementById('transferirChamadoModal'));

    // Carrega a lista de chamados para triagem
    fetchTriagemChamados();

    // Delegação de eventos para os botões na lista
    const ticketsContainer = document.getElementById('tickets-list-container');
    ticketsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('visualizar-btn')) {
            populateDetailsModal(target);
        }
        if (target.classList.contains('transferir-btn')) {
            prepareTransferModal(target);
        }
    });

    // Listener para o formulário de transferência
    document.getElementById('formTransferirChamado').addEventListener('submit', handleTransferSubmit);
});

/**
 * Busca os chamados em triagem e os exibe na página.
 */
async function fetchTriagemChamados() {
    const container = document.getElementById('tickets-list-container');
    // Limpa a lista e adiciona o cabeçalho
    container.innerHTML = `
        <div class="tickets-header d-none d-md-grid">
            <div>Id</div>
            <div>Título</div>
            <div>Status</div>
            <div>Data</div>
            <div class="actions-header">Ações</div>
        </div>`;

    try {
        // ATENÇÃO: Crie o endpoint GET /api/chamados/triagem no backend
        const response = await fetchWithAuth(`/api/chamados/triagem`);
        if (!response.ok) throw new Error('Falha ao carregar chamados para triagem');
        const chamados = await response.json();

        if (chamados.length === 0) {
            container.innerHTML += '<div class="ticket-row" style="grid-column: 1 / -1; text-align: center;">Nenhum chamado para triagem.</div>';
            return;
        }

        chamados.forEach(chamado => {
            const dataAbertura = new Date(chamado.dataAbertura).toLocaleDateString('pt-BR');
            const ticketRow = document.createElement('div');
            ticketRow.className = 'ticket-row';
            ticketRow.innerHTML = `
                <div>${chamado.chamadoId}</div>
                <div>${chamado.tituloChamado}</div>
                <div><span class="status status-pendente">${chamado.statusChamado}</span></div>
                <div>${dataAbertura}</div>
                <div class="ticket-actions text-end">
                    <button class="btn visualizar-btn" 
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"
                        data-chamado='${JSON.stringify(chamado)}'>Visualizar</button>
                    <button class="btn transferir-btn" 
                        data-id="${chamado.chamadoId}" 
                        data-titulo="${chamado.tituloChamado}">Transferir</button>
                </div>
            `;
            container.appendChild(ticketRow);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML += `<div class="ticket-row text-danger" style="grid-column: 1 / -1; text-align: center;">${error.message}</div>`;
    }
}

/**
 * Prepara e abre o modal de transferência.
 */
async function prepareTransferModal(button) {
    const chamadoId = button.dataset.id;
    const chamadoTitulo = button.dataset.titulo;

    document.getElementById('transfer-chamado-id').value = chamadoId;
    document.getElementById('transfer-chamado-titulo').textContent = `"${chamadoTitulo}"`;

    const tecnicoSelect = document.getElementById('tecnico-select');
    tecnicoSelect.innerHTML = '<option value="">Carregando...</option>';

    try {
        // ATENÇÃO: Crie o endpoint GET /api/tecnicos no backend
        const response = await fetchWithAuth(`/api/tecnicos`);
        if (!response.ok) throw new Error('Falha ao carregar técnicos');
        const tecnicos = await response.json();
        
        tecnicoSelect.innerHTML = '<option value="" disabled selected>Selecione um técnico</option>';
        tecnicos.forEach(tecnico => {
            tecnicoSelect.innerHTML += `<option value="${tecnico.id}">${tecnico.nome}</option>`;
        });

        transferModal.show();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

/**
 * Manipula o envio do formulário de transferência.
 */
async function handleTransferSubmit(event) {
    event.preventDefault();
    const chamadoId = document.getElementById('transfer-chamado-id').value;
    const tecnicoId = document.getElementById('tecnico-select').value;

    if (!tecnicoId) {
        alert('Por favor, selecione um técnico.');
        return;
    }

    try {
        // ATENÇÃO: Crie o endpoint POST /api/chamados/{id}/transferir no backend
        const response = await fetchWithAuth(`/api/chamados/${chamadoId}/transferir`, {
            method: 'POST',
            body: JSON.stringify({ tecnicoId: tecnicoId })
        });
        if (!response.ok) throw new Error('Erro ao transferir chamado');

        transferModal.hide();
        await fetchTriagemChamados(); // Atualiza a lista
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

/**
 * Preenche o modal de detalhes (lógica similar a outras páginas).
 */
function populateDetailsModal(button) {
    try {
        const chamado = JSON.parse(button.dataset.chamado);
        // ... (aqui iria a lógica para preencher o modal de detalhes, 
        // que pode ser padronizada e movida para main.js no futuro)
        alert(`Visualizando detalhes do chamado: ${chamado.tituloChamado}`);
    } catch (e) {
        console.error("Erro ao ler dados do chamado:", e);
    }
}
