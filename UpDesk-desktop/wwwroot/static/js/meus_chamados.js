document.addEventListener("DOMContentLoaded", async () => {


    const user = JSON.parse(localStorage.getItem("usuario"));
    const userId = user.id;
    

    if (!userId) {
        alert("Usuário não encontrado. Faça login novamente.");
        window.location.href = "/templates/index.html";
        return;
    }
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

        
        const linkAtender = visualizarChamadoModal.querySelector("#visualizarChamadoModal");
        if (linkAtender) {
            linkAtender.href = `/templates/meus_chamados.html?id=${chamado.chamadoId}`;
        }

    } catch (error) {
        console.error(error);
        visualizarChamadoModal.querySelector('#modal-titulo').textContent = 'Erro ao carregar chamado';
        visualizarChamadoModal.querySelector('#modal-descricao').textContent = 'Não foi possível obter os detalhes deste chamado.';
    }
});

    async function carregarChamados() {
        const response = await fetch(`/api/chamados?solicitanteId=${userId}`);
        const chamados = await response.json();
        renderTabela(chamados);
    }


    function renderTabela(lista) {
        const corpo = document.getElementById("chamados-table-body");
        corpo.innerHTML = "";

        lista.forEach(ch => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${ch.tituloChamado}</td>
                <td>${ch.prioridadeChamado}</td>
                <td>${ch.statusChamado}</td>
                <td>${new Date(ch.dataAbertura).toLocaleString()}</td>
                <td class="ticket-actions text-end">
                    <button class="btn btn-vizualizar-triagem btn-sm visualizar-btn"
                        data-bs-toggle="modal" 
                        data-bs-target="#visualizarChamadoModal"><i class="bi bi-eye"></i><br>
                        Visualizar
                    </button>
                </td>
            `;

            corpo.appendChild(tr);
        });
    }

    // EVENTO DO BOTÃO VER DETALHES
    document.addEventListener("click", async e => {
        if (e.target.classList.contains("ver-detalhes")) {
            const id = e.target.getAttribute("data-id");

            const response = await fetch(`/api/chamados/`);
            const chamado = await response.json();

            preencherModal(chamado);

            new bootstrap.Modal(
                document.getElementById("visualizarChamadoModal")
            ).show();
        }
    });

    function preencherModal(ch) {
        document.getElementById("modal-titulo").textContent = chamado.tituloChamado;
        document.getElementById("modal-data-abertura").textContent =
            new Date(ch.data_abertura).toLocaleString();

        document.getElementById("modal-solicitante-nome").textContent = chamado.solicitanteNome;
        document.getElementById("modal-solicitante-email").textContent = ch.solicitante?.email;
        document.getElementById("modal-solicitante-ramal").textContent = ch.solicitante?.ramal;

        document.getElementById("modal-status").textContent = ch.statusChamado;
        document.getElementById("modal-categoria").textContent = ch.categoriaChamado;
        document.getElementById("modal-descricao").textContent = ch.descricaoChamado;
    }

    carregarChamados();
});
