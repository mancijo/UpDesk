// /static/js/verChamado.js

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
        const response = await fetchWithAuth(`/api/chamados/${chamadoId}`);
        if (!response.ok) throw new Error('Erro ao carregar detalhes do chamado');
        const chamado = await response.json();

        // Atualiza o modal com dados reais
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = chamado.tituloChamado || 'Sem título';
        visualizarChamadoModal.querySelector('#modal-data-abertura').textContent =
            chamado.dataAbertura ? `Aberto em: ${new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}` : '';
        visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = chamado.solicitanteNome || 'N/A';
        visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = chamado.solicitanteEmail || 'N/A';
        visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = chamado.solicitanteTelefone || 'N/A';
        visualizarChamadoModal.querySelector('#modal-status').textContent = chamado.statusChamado || '---';
        visualizarChamadoModal.querySelector('#modal-categoria').textContent = chamado.categoriaChamado || '---';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = chamado.descricaoChamado || 'Sem descrição disponível';

        // 🔥 AQUI ESTÁ A CORREÇÃO DO BOTÃO “ATENDER CHAMADO”
        const linkAtender = visualizarChamadoModal.querySelector("#modal-atender-chamado-link");
        if (linkAtender) {
            linkAtender.href = `/templates/atender_chamado.html?id=${chamado.chamadoId}`;
        }

    } catch (error) {
        console.error(error);
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Erro ao carregar chamado';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = 'Não foi possível obter os detalhes deste chamado.';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');

    fetchAndDisplayChamados();

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

    const params = new URLSearchParams();
    if (status && status !== 'Todos os Status') params.append('status', status);
    if (query) params.append('q', query);

    const userData = JSON.parse(localStorage.getItem('usuario'));
    const userRole = userData && userData.cargo ? userData.cargo.trim() : null;
    const techRoles = ['Supervisor', 'Técnico N1', 'Técnico N2', 'Triagem'];

    if (userRole && !techRoles.includes(userRole)) {
        params.append('meus_chamados', 'true');
    }

    try {
        const response = await fetchWithAuth(`/api/chamados?${params.toString()}`);
        if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
        const chamados = await response.json();

        tableBody.innerHTML = '';

        if (chamados.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum chamado encontrado.</td></tr>';
            return;
        }

        chamados.forEach(chamado => {
            const row = document.createElement('tr');

            const dataAbertura = new Date(chamado.dataAbertura).toLocaleString('pt-BR');

            let atenderButtonHtml = '';
            if (userRole && techRoles.includes(userRole)) {
                atenderButtonHtml =
                    `<a href="/templates/atender_chamado.html?id=${chamado.chamadoId}" class="btn btn-atender">Atender</a>`;
            }

            row.innerHTML = `
                <td>${chamado.tituloChamado || 'N/A'}</td>
                <td>${chamado.prioridadeChamado || 'N/A'}</td>
                <td>${chamado.statusChamado || 'N/A'}</td>
                <td>${dataAbertura}</td>
                <td>
                    <button class="btn btn-vizualizar visualizar-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#visualizarChamadoModal"
                        data-id="${chamado.chamadoId}">
                        Ver detalhes
                    </button>
                    ${atenderButtonHtml}
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Falha ao buscar chamados:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Falha ao carregar chamados.</td></tr>';
    }
}

// ---------------- PDF EXPORT -----------------
document.getElementById("export-pdf-button").addEventListener("click", async () => {
    const intervalo = document.getElementById("report-intervalo").value;
    const status = document.getElementById("report-status").value;

    // Enviar para o processo principal do Electron
    window.electronAPI.exportarPDF({
        intervalo,
        status
    });
});


