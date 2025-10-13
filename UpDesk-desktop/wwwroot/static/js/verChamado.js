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
    const params = new URLSearchParams();
    if (status && status !== 'Todos os Status') {
        params.append('status', status);
    }
    if (query) params.append('q', query);

    try {
        const response = await fetchWithAuth(`/api/chamados?${params.toString()}`);
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
                <td>${chamado.tituloChamado || 'N/A'}</td>
                <td>${chamado.prioridadeChamado || 'N/A'}</td>
                <td>${chamado.statusChamado || 'N/A'}</td>
                <td>${dataAbertura}</td>
                <td>
                    <button class="btn btn-secondary btn-sm visualizar-btn" 
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"
                        data-id="${chamado.chamadoId}">Ver detalhes</button>
                    <a href="/templates/atender_chamado.html?id=${chamado.chamadoId}" class="btn btn-primary btn-sm">Atender</a>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Falha ao buscar chamados:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Falha ao carregar chamados.</td></tr>';
    }
}
