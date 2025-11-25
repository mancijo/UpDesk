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
    // Normaliza valores que podem vir vazios ou como string 'None'
    if (!solicitanteNome || solicitanteNome === 'None') solicitanteNome = 'Não informado';
    if (!solicitanteEmail || solicitanteEmail === 'None') solicitanteEmail = 'Não informado';
    if (!solicitanteRamal || solicitanteRamal === 'None') solicitanteRamal = 'Não informado';
    var status = button.getAttribute('data-status');
    var prioridade = button.getAttribute('data-prioridade');
    var descricao = button.getAttribute('data-descricao');

        // Atualiza o conteúdo do modal
        var modalTitle = visualizarChamadoModal.querySelector('.modal-title');
        var modalDataAbertura = visualizarChamadoModal.querySelector('#modal-data-abertura');
        var modalSolicitanteNome = visualizarChamadoModal.querySelector('#modal-solicitante-nome');
        var modalSolicitanteEmail = visualizarChamadoModal.querySelector('#modal-solicitante-email');
        var modalSolicitanteRamal = visualizarChamadoModal.querySelector('#modal-solicitante-ramal');
        var modalTitulo = visualizarChamadoModal.querySelector('#modal-titulo');
    var modalStatus = visualizarChamadoModal.querySelector('#modal-status');
        var modalDescricao = visualizarChamadoModal.querySelector('#modal-descricao');
    var iniciarTriagemBtn = visualizarChamadoModal.querySelector('#triarChamadoBtn');
    var devolverTriagemBtn = visualizarChamadoModal.querySelector('#devolverTriagemBtn');

        // Show the real chamado title in the modal header
        if (titulo && titulo !== 'None') {
            modalTitle.textContent = titulo;
        } else {
            modalTitle.textContent = 'Chamado #' + chamadoId;
        }
        modalDataAbertura.textContent = 'Aberto em: ' + (dataAbertura || 'Não informado');
    modalSolicitanteNome.textContent = solicitanteNome;
    modalSolicitanteEmail.textContent = solicitanteEmail;
    modalSolicitanteRamal.textContent = solicitanteRamal;
    if (modalTitulo) modalTitulo.textContent = titulo;
        modalStatus.textContent = status || 'Não informado';
        var modalPrioridade = visualizarChamadoModal.querySelector('#modal-prioridade');
        if (modalPrioridade) {
            modalPrioridade.textContent = prioridade || 'Não Classificada';
        }
        modalDescricao.innerHTML = descricao.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>
        
    // Atualiza o link do botão "Triar Chamado" para abrir a página de triagem
    // (aplica somente se o elemento existe - evita erro quando o botão foi removido)
    if (iniciarTriagemBtn) {
        iniciarTriagemBtn.href = `/chamados/transferir/${chamadoId}`;
    }
    // Atualiza o link do botão "Devolver para Triagem" somente se existir
    if (devolverTriagemBtn) {
        devolverTriagemBtn.href = `/chamados/devolver_triagem/${chamadoId}`;
    }
        // Preenche select de prioridade se presente (para alteração inline)
        var prioridadeSelect = visualizarChamadoModal.querySelector('#modal-prioridade-select');
        if (prioridadeSelect) {
            prioridadeSelect.value = prioridade || 'Não Classificada';
            var formPrioridade = visualizarChamadoModal.querySelector('#modal-alterar-prioridade-form');
            if (formPrioridade) {
                formPrioridade.action = `/chamados/alterar_prioridade/${chamadoId}`;
            }
        }
    });
});