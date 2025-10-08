// /static/js/verChamado.js

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const exportPdfButton = document.getElementById('export-pdf-button');
    const detailsModal = document.getElementById('visualizarChamadoModal');

    // Carrega os chamados quando a página é carregada
    fetchAndDisplayChamados();

    // Adiciona listeners para os filtros e busca
    searchButton.addEventListener('click', fetchAndDisplayChamados);
    statusFilter.addEventListener('change', fetchAndDisplayChamados);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchAndDisplayChamados();
        }
    });

    // Listener para o botão de exportar PDF
    if(exportPdfButton) {
        exportPdfButton.addEventListener('click', exportToPdf);
    }

    // Listener para popular o modal de detalhes
    if(detailsModal) {
        detailsModal.addEventListener('show.bs.modal', populateDetailsModal);
    }
});

/**
 * Busca os chamados na API com base nos filtros e os exibe na tabela.
 */
async function fetchAndDisplayChamados() {
    console.log('Iniciando fetchAndDisplayChamados');
    const status = document.getElementById('status-filter').value;
    const query = document.getElementById('search-input').value;
    const tableBody = document.getElementById('chamados-table-body');

    // Constrói a URL da API com os parâmetros de busca
    // ATENÇÃO: O endpoint GET /api/chamados precisa ser criado no backend
    // e ele deve aceitar os parâmetros 'status' e 'q'.
    const url = new URL(`${apiUrl}/api/chamados`);
    if (status) url.searchParams.append('status', status);
    if (query) url.searchParams.append('q', query);

    try {
        const response = await fetchWithAuth(url);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        const chamados = await response.json();
        console.log('Chamados recebidos:', chamados);

        tableBody.innerHTML = ''; // Limpa a tabela

        if (chamados.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum chamado encontrado.</td></tr>';
            return;
        }

        chamados.forEach(chamado => {
            const row = document.createElement('tr');

            // Formata a data para o padrão brasileiro
            const dataAbertura = new Date(chamado.dataAbertura).toLocaleString('pt-BR');

            row.innerHTML = `
                <td>${chamado.titulo}</td>
                <td>${chamado.prioridade}</td>
                <td>${chamado.status}</td>
                <td>${dataAbertura}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" 
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"
                        data-chamado-id="${chamado.id}"
                        data-titulo="${chamado.titulo}"
                        data-data-abertura="${dataAbertura}"
                        data-solicitante-nome="${chamado.solicitante?.nome || 'Não informado'}"
                        data-solicitante-email="${chamado.solicitante?.email || 'Não informado'}"
                        data-solicitante-ramal="${chamado.solicitante?.telefone || 'Não informado'}"
                        data-status="${chamado.status}"
                        data-categoria="${chamado.categoria}"
                        data-descricao="${chamado.descricao}">Ver detalhes</button>
                    <a href="/templates/atender_chamado.html?id=${chamado.id}" class="btn btn-primary btn-sm">Atender</a>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Falha ao buscar chamados:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Falha ao carregar chamados.</td></tr>';
    }
}

/**
 * Preenche o modal de detalhes com as informações do chamado.
 */
function populateDetailsModal(event) {
    const button = event.relatedTarget; // O botão que acionou o modal
    
    // Extrai as informações dos atributos data-*
    const id = button.getAttribute('data-chamado-id');
    const titulo = button.getAttribute('data-titulo');
    const dataAbertura = button.getAttribute('data-data-abertura');
    const solicitanteNome = button.getAttribute('data-solicitante-nome');
    const solicitanteEmail = button.getAttribute('data-solicitante-email');
    const solicitanteRamal = button.getAttribute('data-solicitante-ramal');
    const status = button.getAttribute('data-status');
    const categoria = button.getAttribute('data-categoria');
    const descricao = button.getAttribute('data-descricao');

    // Preenche os campos do modal
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-data-abertura').textContent = `Aberto em: ${dataAbertura}`;
    document.getElementById('modal-solicitante-nome').textContent = solicitanteNome;
    document.getElementById('modal-solicitante-email').textContent = solicitanteEmail;
    document.getElementById('modal-solicitante-ramal').textContent = solicitanteRamal;
    document.getElementById('modal-status').textContent = status;
    document.getElementById('modal-categoria').textContent = categoria;
    document.getElementById('modal-descricao').textContent = descricao;
    
    // Atualiza o link do botão "Atender Chamado"
    const atenderLink = document.getElementById('modal-atender-chamado-link');
    if(atenderLink) {
        atenderLink.href = `/templates/atender_chamado.html?id=${id}`;
    }
}

/**
 * Abre uma nova janela para exportar o relatório em PDF.
 */
function exportToPdf() {
    const intervalo = document.getElementById('report-intervalo').value;
    const status = document.getElementById('report-status').value;

    // ATENÇÃO: O endpoint GET /api/relatorios/pdf precisa ser criado no backend
    // e ele deve aceitar os parâmetros 'intervalo' e 'status'.
    const url = new URL(`${apiUrl}/api/relatorios/pdf`);
    url.searchParams.append('intervalo', intervalo);
    if (status) url.searchParams.append('status', status);

    // Abre o PDF em uma nova aba/janela
    window.open(url, '_blank');
}
