// /static/js/triagem.js

const visualizarChamadoModal = document.getElementById('visualizarChamadoModal');

visualizarChamadoModal.addEventListener('show.bs.modal', async (event) => {
    const button = event.relatedTarget;
    const chamadoId = button.getAttribute('data-id');

    // Exibe "Carregando..." enquanto busca os dados
    visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Carregando...';
    visualizarChamadoModal.querySelector('#modal-data-abertura').textContent = '';
    visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = '';
    visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = '';
    visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = '';
    visualizarChamadoModal.querySelector('#modal-status').textContent = '';
    visualizarChamadoModal.querySelector('#modal-categoria').textContent = '';
    visualizarChamadoModal.querySelector('#modal-descricao').textContent = '';

    try {
        // Busca os detalhes completos do chamado
        const response = await fetchWithAuth(`/api/chamados/${chamadoId}`);
        if (!response.ok) throw new Error('Erro ao carregar detalhes do chamado');
        const chamado = await response.json();

        // Atualiza o modal com dados reais
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = chamado.tituloChamado || 'Sem título';
        visualizarChamadoModal.querySelector('#modal-data-abertura').textContent = 
            chamado.dataAbertura ? `Aberto em: ${new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}` : '';
        visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = chamado.solicitanteNome || 'N/A';
        visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = chamado.solicitanteEmail || 'N/A';
        visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = chamado.solicitanteRamal || 'N/A';
        visualizarChamadoModal.querySelector('#modal-status').textContent = chamado.statusChamado || '---';
        visualizarChamadoModal.querySelector('#modal-categoria').textContent = chamado.categoriaChamado || '---';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = chamado.descricaoChamado || 'Sem descrição disponível';

    } catch (error) {
        console.error(error);
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Erro ao carregar chamado';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = 'Não foi possível obter os detalhes deste chamado.';
    }
});

let transferModal;

document.addEventListener('DOMContentLoaded', () => {
    transferModal = new bootstrap.Modal(document.getElementById('transferirChamadoModal'));

    // Carrega a lista de chamados para triagem
    fetchTriagemChamados();

    // Delegação de eventos para os botões na lista
    const ticketsContainer = document.getElementById('tickets-list-container');
    ticketsContainer.addEventListener('click', (event) => {
        const target = event.target;
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
        // Endpoint GET /api/chamados/triagem
        const response = await fetchWithAuth(`/api/chamados/triagem`);
        if (!response.ok) throw new Error('Falha ao carregar chamados para triagem');

        const chamados = await response.json();
        console.log(chamados);

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
                        data-id="${chamado.chamadoId}"
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"
                        data-titulo="${chamado.tituloChamado || ''}"
                        data-data-abertura="${dataAbertura}"
                        data-solicitante-nome="${chamado.solicitanteNome || 'N/A'}"
                        data-solicitante-email="${chamado.solicitanteEmail || 'N/A'}"
                        data-solicitante-ramal="${chamado.solicitanteRamal || 'N/A'}"
                        data-status="${chamado.statusChamado || ''}"
                        data-categoria="${chamado.categoriaChamado || ''}"
                        data-descricao="${chamado.descricaoChamado || ''}">
                        Visualizar
                    </button>
                    <button class="btn transferir-btn" 
                        data-id="${chamado.chamadoId}" 
                        data-titulo="${chamado.tituloChamado}">
                        Transferir
                    </button>
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
