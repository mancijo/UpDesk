const visualizarChamadoModal = document.getElementById('visualizarChamadoModal');
visualizarChamadoModal.addEventListener('show.bs.modal', event => {
    // Botão que acionou o modal
    const button = event.relatedTarget;

    // Extrai as informações dos atributos data-*
    const titulo = button.getAttribute('data-titulo');
    const dataAbertura = button.getAttribute('data-data-abertura');
    const solicitanteNome = button.getAttribute('data-solicitante-nome');
    const solicitanteEmail = button.getAttribute('data-solicitante-email');
    const solicitanteRamal = button.getAttribute('data-solicitante-ramal');
    const status = button.getAttribute('data-status');
    const categoria = button.getAttribute('data-categoria');
    const descricao = button.getAttribute('data-descricao');

    // Atualiza o conteúdo do modal
    visualizarChamadoModal.querySelector('#modal-data-abertura').textContent = `Aberto em: ${dataAbertura}`;
    visualizarChamadoModal.querySelector('#modal-solicitante-nome').textContent = solicitanteNome;
    visualizarChamadoModal.querySelector('#modal-solicitante-email').textContent = solicitanteEmail;
    visualizarChamadoModal.querySelector('#modal-solicitante-ramal').textContent = solicitanteRamal;
    visualizarChamadoModal.querySelector('#modal-titulo').textContent = titulo;
    visualizarChamadoModal.querySelector('#modal-status').textContent = status;
    visualizarChamadoModal.querySelector('#modal-categoria').textContent = categoria;
    visualizarChamadoModal.querySelector('#modal-descricao').textContent = `"${descricao}"`;
});