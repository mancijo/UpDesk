document.addEventListener('DOMContentLoaded', () => {
    const visualizarChamadoModal = document.getElementById('visualizarChamadoModal');

    visualizarChamadoModal.addEventListener('show.bs.modal', (event) => {
        // Botão que acionou o modal
        const button = event.relatedTarget;

        // Extrai informações dos atributos data-*
        const chamadoId = button.dataset.chamadoId; // ID do chamado para o link de atendimento
        const titulo = button.dataset.titulo;
        const dataAbertura = button.dataset.dataAbertura;
        const solicitanteNome = button.dataset.solicitanteNome;
        const solicitanteEmail = button.dataset.solicitanteEmail;
        const solicitanteRamal = button.dataset.solicitanteRamal;
        const status = button.dataset.status;
        const categoria = button.dataset.categoria;
        const descricao = button.dataset.descricao;

        // Atualiza o conteúdo do modal
        const modalTitle = visualizarChamadoModal.querySelector('#modal-titulo');
        const modalDataAbertura = visualizarChamadoModal.querySelector('#modal-data-abertura');
        const modalSolicitanteNome = visualizarChamadoModal.querySelector('#modal-solicitante-nome');
        const modalSolicitanteEmail = visualizarChamadoModal.querySelector('#modal-solicitante-email');
        const modalSolicitanteRamal = visualizarChamadoModal.querySelector('#modal-solicitante-ramal');
        const modalStatus = visualizarChamadoModal.querySelector('#modal-status');
        const modalCategoria = visualizarChamadoModal.querySelector('#modal-categoria');
        const modalDescricao = visualizarChamadoModal.querySelector('#modal-descricao');
        const modalAtenderBtn = visualizarChamadoModal.querySelector('#modal-atender-chamado-btn'); // Botão Atender Chamado no modal

        modalTitle.textContent = titulo;
        modalDataAbertura.textContent = `Aberto em: ${dataAbertura}`;
        modalSolicitanteNome.textContent = solicitanteNome;
        modalSolicitanteEmail.textContent = solicitanteEmail;
        modalSolicitanteRamal.textContent = solicitanteRamal;
        modalStatus.textContent = status;
        modalCategoria.textContent = categoria;
        modalDescricao.textContent = descricao;

        // Lógica para exibir/ocultar e configurar o botão "Atender Chamado" no modal
        if (status === 'Aberto' || status === 'Em Atendimento') {
            modalAtenderBtn.classList.remove('d-none');
            modalAtenderBtn.href = `/chamados/atender/${chamadoId}`;
        } else {
            modalAtenderBtn.classList.add('d-none');
        }
    });
});