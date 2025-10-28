document.addEventListener('DOMContentLoaded', function () {
    var visualizarChamadoModal = document.getElementById('visualizarChamadoModal');
    visualizarChamadoModal.addEventListener('show.bs.modal', function (event) {
        // Botão que acionou o modal
        var button = event.relatedTarget;

        // Extrai as informações dos atributos data-*
        var chamadoId = button.getAttribute('data-id');
        var titulo = button.getAttribute('data-titulo');
        var dataAbertura = button.getAttribute('data-data-abertura');
        var solicitanteNome = button.getAttribute('data-solicitante-nome');
        var solicitanteEmail = button.getAttribute('data-solicitante-email');
        var solicitanteRamal = button.getAttribute('data-solicitante-ramal');
        var status = button.getAttribute('data-status');
        var categoria = button.getAttribute('data-categoria');
        var descricao = button.getAttribute('data-descricao');

        // Atualiza o conteúdo do modal
        var modalTitle = visualizarChamadoModal.querySelector('.modal-title');
        var modalDataAbertura = visualizarChamadoModal.querySelector('#modal-data-abertura');
        var modalSolicitanteNome = visualizarChamadoModal.querySelector('#modal-solicitante-nome');
        var modalSolicitanteEmail = visualizarChamadoModal.querySelector('#modal-solicitante-email');
        var modalSolicitanteRamal = visualizarChamadoModal.querySelector('#modal-solicitante-ramal');
        var modalTitulo = visualizarChamadoModal.querySelector('#modal-titulo');
        var modalStatus = visualizarChamadoModal.querySelector('#modal-status');
        var modalCategoria = visualizarChamadoModal.querySelector('#modal-categoria');
        var modalDescricao = visualizarChamadoModal.querySelector('#modal-descricao');
        var iniciarTriagemBtn = visualizarChamadoModal.querySelector('#triarChamadoBtn');
        var devolverTriagemBtn = visualizarChamadoModal.querySelector('#devolverTriagemBtn');

        modalTitle.textContent = 'Dados do Chamado #' + chamadoId;
        modalDataAbertura.textContent = 'Aberto em: ' + dataAbertura;
        modalSolicitanteNome.textContent = solicitanteNome;
        modalSolicitanteEmail.textContent = solicitanteEmail;
        modalSolicitanteRamal.textContent = solicitanteRamal;
        modalTitulo.textContent = titulo;
        modalStatus.textContent = status;
        modalCategoria.textContent = categoria;
        modalDescricao.innerHTML = descricao.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>
        
    // Atualiza o link do botão "Triar Chamado" para abrir a página de transferência
    iniciarTriagemBtn.href = `/chamados/transferir/${chamadoId}`;
        // Atualiza o link do botão "Devolver para Triagem" para a rota correta
        devolverTriagemBtn.href = `/chamados/devolver_triagem/${chamadoId}`;
    });
});