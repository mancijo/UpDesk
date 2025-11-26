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

// Função principal que aplica busca + filtro por status
    function aplicarFiltrosTriagem(chamados) {
        const termoBusca = document.getElementById('search-input').value.toLowerCase();
        const statusFiltro = document.getElementById('status-filter').value;


    return chamados.filter(c => {
        const tituloMatch = c.tituloChamado.toLowerCase().includes(termoBusca);
        const statusMatch = statusFiltro ? c.statusChamado === statusFiltro : true;
        return tituloMatch && statusMatch;
        });
    }


document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    transferModal = new bootstrap.Modal(document.getElementById('transferirChamadoModal'));
    

    

    // EVENTO DO BOTÃO DE BUSCA
    document.getElementById("search-button").addEventListener("click", () => {
    fetchTriagemChamados();
    });

    // ENTER para buscar
    document.getElementById("search-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") fetchTriagemChamados();
    });

    // Filtro de status
    document.getElementById("status-filter").addEventListener("change", () => {
    fetchTriagemChamados();
    });

    // ===== FILTROS E BUSCA NA TRIAGEM =====

    
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

        let chamados = await response.json();

        // Aplica filtros (busca + status)
        chamados = aplicarFiltrosTriagem(chamados);


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
                <td>${chamado.solicitanteNome}</td>
                <td>${chamado.categoriaChamado}</td>
                <td>${chamado.prioridadeChamado}</td>
                <td>${dataAbertura}</td>
                <td><span class="status status-pendente">${chamado.statusChamado}</span></td>
                    <td class="ticket-actions text-end">
                        <div class="d-flex gap-2 justify-content-end align-items-center">
                            <button class="btn btn-vizualizar-triagem btn-sm visualizar-btn"
                                data-id="${chamado.chamadoId}"
                                data-bs-toggle="modal" 
                                data-bs-target="#visualizarChamadoModal"><i class="bi bi-eye"></i>
                                Visualizar
                            </button>
                            <a href="atendimento_triagem.html?id=${chamado.chamadoId}" class="btn btn-transferir-triagem btn-sm">
                                <i class="bi bi-headset"></i> Triar
                            </a>
                        </div>
                    </td>
            `;

            container.appendChild(tableRow);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>`;
    }
}

async function fetchDashboardStats() {
    try {
        // ATENÇÃO: Este endpoint '/api/dashboard/stats' precisa ser criado no seu backend C#.
        const response = await fetchWithAuth('/api/dashboard/stats');

        if (!response.ok) {
            // Se a resposta não for OK, exibe um erro no console.
            console.error('Erro ao buscar estatísticas do dashboard:', response.status, response.statusText);
            // Você pode querer exibir uma mensagem de erro para o usuário na página aqui.
            return;
        }

        const stats = await response.json();

        // Atualiza a interface com os dados recebidos da API.
        document.getElementById('Aguardando-triagem-count').textContent = stats.chamadosEmTriagem || 0;
        document.getElementById('chamados-triados-hoje-count').textContent = stats.chamadosFinalizados || 0;
        document.getElementById('chamados-pendentes-24h-count').textContent = stats.chamadosAbertos || 0;
        
        
        
        

    } catch (error) {
        // Captura erros de rede ou da função fetchWithAuth (ex: token inválido).
        console.error('Falha ao carregar estatísticas do dashboard:', error);
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
