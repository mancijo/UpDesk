document.addEventListener("DOMContentLoaded", async () => {

    const searchButton = document.getElementById('search-button');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search-input');
    const tableBody = document.getElementById('chamados-table-body');

    const user = JSON.parse(localStorage.getItem("usuario"));
    const userId = user?.id;
    const userRole = user?.cargo?.trim();
    const techRoles = ['Supervisor', 'Técnico N1', 'Técnico N2', 'Triagem'];

    if (!userId) {
        alert("Usuário não encontrado. Faça login novamente.");
        window.location.href = "/templates/index.html";
        return;
    }

    // EVENTOS
    searchButton.addEventListener('click', fetchAndDisplayChamados);
    statusFilter.addEventListener('change', fetchAndDisplayChamados);
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') fetchAndDisplayChamados();
    });

    // CHAMAR AO INICIAR A PÁGINA
    fetchAndDisplayChamados();


    // =================================================================================
    //  BUSCAR CHAMADOS FILTRADOS 
    // =================================================================================
    async function fetchAndDisplayChamados() {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

        const params = new URLSearchParams();

        const status = statusFilter.value;
        const query = searchInput.value;

        if (status && status !== 'Todos os Status') params.append('status', status);
        if (query) params.append('q', query);

        // Se NÃO for técnico → mostrar apenas seus chamados
        if (!techRoles.includes(userRole)) {
            params.append('solicitanteId', userId);
        }

        try {
            const response = await fetchWithAuth(`/api/chamados?${params.toString()}`);

            if (!response.ok) throw new Error("Erro ao buscar chamados");

            const chamados = await response.json();

            renderTabela(chamados);

        } catch (error) {
            console.error(error);
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Erro ao carregar chamados.</td></tr>';
        }
    }


    // =================================================================================
    //  RENDERIZAR TABELA 
    // =================================================================================
    function renderTabela(lista) {
        tableBody.innerHTML = "";

        if (lista.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum chamado encontrado.</td></tr>';
            return;
        }

        lista.forEach(ch => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${ch.tituloChamado}</td>
                <td>${ch.prioridadeChamado}</td>
                <td>${ch.statusChamado}</td>
                <td>${new Date(ch.dataAbertura).toLocaleString()}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-ver-detalhes visualizar-btn"
                        data-id="${ch.chamadoId}"
                        data-bs-toggle="modal"
                        data-bs-target="#visualizarChamadoModal">
                        <i class="bi bi-eye"></i> Ver detalhes
                    </button>
                </td>
            `;

            tableBody.appendChild(tr);
        });
    }


    // =================================================================================
    //  MODAL DE DETALHES
    // =================================================================================
    const visualizarChamadoModal = document.getElementById('visualizarChamadoModal');

    visualizarChamadoModal.addEventListener('show.bs.modal', async event => {
        const button = event.relatedTarget;
        const chamadoId = button.dataset.id;

        try {
            const response = await fetchWithAuth(`/api/chamados/${chamadoId}`);
            if (!response.ok) throw new Error("Falha ao carregar detalhes");

            const ch = await response.json();

            visualizarChamadoModal.querySelector('#modal-titulo').textContent = ch.tituloChamado;
            visualizarChamadoModal.querySelector('#modal-data-abertura').textContent = new Date(ch.dataAbertura).toLocaleDateString("pt-BR");
            visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = ch.solicitanteNome || "N/A";
            visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = ch.solicitanteEmail || "N/A";
            visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = ch.solicitanteTelefone || "N/A";
            visualizarChamadoModal.querySelector('#modal-status').textContent = ch.statusChamado;
            visualizarChamadoModal.querySelector('#modal-categoria').textContent = ch.categoriaChamado;
            visualizarChamadoModal.querySelector('#modal-descricao').textContent = ch.descricaoChamado;

        } catch (err) {
            console.error(err);
        }
    });

});
