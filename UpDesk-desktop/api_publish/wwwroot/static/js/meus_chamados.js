document.addEventListener("DOMContentLoaded", async () => {


    const user = JSON.parse(localStorage.getItem("usuario"));
    const userId = user.id;
    

    if (!userId) {
        alert("Usuário não encontrado. Faça login novamente.");
        window.location.href = "/templates/index.html";
        return;
    }

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
                <td>${ch.solicitanteNome}</td>
                <td>${new Date(ch.dataAbertura).toLocaleString()}</td>
                <td>
                    <button id="visualizarChamadoModal" class="btn btn-primary btn-sm ver-detalhes" data-id="${ch.id}">
                        Ver detalhes
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
        document.getElementById("modal-titulo").textContent = ch.titulo;
        document.getElementById("modal-data-abertura").textContent =
            new Date(ch.data_abertura).toLocaleString();

        document.getElementById("modal-solicitante-nome").textContent = ch.solicitante?.nome;
        document.getElementById("modal-solicitante-email").textContent = ch.solicitante?.email;
        document.getElementById("modal-solicitante-ramal").textContent = ch.solicitante?.ramal;

        document.getElementById("modal-status").textContent = ch.statusChamado;
        document.getElementById("modal-categoria").textContent = ch.categoriaChamado;
        document.getElementById("modal-descricao").textContent = ch.descricaoChamado;
    }

    carregarChamados();
});
