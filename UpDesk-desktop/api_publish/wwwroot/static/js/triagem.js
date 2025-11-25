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
    // Carrega a lista de técnicos para o select    
    carregarTecnicos();


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
    // Limpa a lista
    container.innerHTML = '';

    try {
        // Endpoint GET /api/chamados/triagem
        const response = await fetchWithAuth(`/api/chamados/triagem`);
        if (!response.ok) throw new Error('Falha ao carregar chamados para triagem');

        const chamados = await response.json();
        console.log(chamados);

        if (chamados.length === 0) {
            container.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum chamado para triagem.</td></tr>';
            return;
        }

        chamados.forEach(chamado => {
            const dataAbertura = new Date(chamado.dataAbertura).toLocaleDateString('pt-BR');

            const tableRow = document.createElement('tr');

            tableRow.innerHTML = `
                <td>${chamado.chamadoId}</td>
                <td>${chamado.tituloChamado}</td>
                <td><span class="status status-pendente">${chamado.statusChamado}</span></td>
                <td>${dataAbertura}</td>
                <td class="ticket-actions text-end">
                    <button class="btn btn-vizualizar-triagem btn-sm visualizar-btn"
                        data-id="${chamado.chamadoId}"
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"><i class="bi bi-eye"></i><br>
                        Visualizar
                    </button>
                    <button class="btn btn-transferir-triagem btn-sm transferir-btn" 
                        data-id="${chamado.chamadoId}" 
                        data-titulo="${chamado.tituloChamado}"><i class="bi bi-headset"></i><br>
                        Transferir
                    </button>
                </td>
            `;

            container.appendChild(tableRow);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

/**
 * Prepara e abre o modal de transferência.
 */
function prepareTransferModal(button) {
    const chamadoId = button.dataset.id;
    const chamadoTitulo = button.dataset.titulo;

    document.getElementById('transfer-chamado-id').value = chamadoId;
    document.getElementById('transfer-chamado-titulo').textContent = `"${chamadoTitulo}"`;

    // Apenas mostra o modal, já que o select é fixo
    transferModal.show();
}


/**
 * Manipula o envio do formulário de transferência.
 */
async function handleTransferSubmit(event) {
    event.preventDefault();

    const chamadoId = document.getElementById('transfer-chamado-id').value;
    const novoAtendenteId = document.getElementById('tecnico-select').value; // <-- CORRETO

    if (!novoAtendenteId) {
        alert('Por favor, selecione um técnico.');
        return;
    }

    try {
        const response = await fetchWithAuth(`http://localhost:5291/api/chamados/${chamadoId}/transferir`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                novoAtendenteId: novoAtendenteId  // <-- agora a variável existe
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Backend retornou erro:", text);
            throw new Error('Erro ao transferir chamado');
        }

        transferModal.hide();
        mostrarPopupSucesso("Chamado transferido com sucesso!");

        await fetchTriagemChamados(); // Atualizar tabela

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function mostrarPopupSucesso(mensagem) {
    const toastContainer = document.createElement('div');
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    toastContainer.innerHTML = `
        <div class="toast align-items-center text-bg-success border-0 show">
            <div class="d-flex">
                <div class="toast-body">
                    ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    document.body.appendChild(toastContainer);

    setTimeout(() => toastContainer.remove(), 3000);
}

async function carregarTecnicos() {
    const response = await fetchWithAuth("/api/tecnicos");
    const tecnicos = await response.json();

    const select = document.getElementById("tecnico-select");
    select.innerHTML = `<option value="" disabled selected>Selecione um técnico</option>`;

    tecnicos.forEach(t => {
        const option = document.createElement("option");
        option.value = t.id;     // <-- agora é INT
        option.textContent = t.nome;
        select.appendChild(option);
    });
}
