document.addEventListener('DOMContentLoaded', function() {
    var visualizarChamadoModal = document.getElementById('visualizarChamadoModal');
    visualizarChamadoModal.addEventListener('show.bs.modal', function (event) {
        // Botão que acionou o modal
        var button = event.relatedTarget;

        // Extrai informações dos atributos data-*
        var chamadoId = button.getAttribute('data-chamado-id');
        var titulo = button.getAttribute('data-titulo');
        var dataAbertura = button.getAttribute('data-data-abertura');
        var solicitanteNome = button.getAttribute('data-solicitante-nome');
        var solicitanteEmail = button.getAttribute('data-solicitante-email');
        var solicitanteRamal = button.getAttribute('data-solicitante-ramal');
    var status = button.getAttribute('data-status');
    var prioridade = button.getAttribute('data-prioridade');
    var descricao = button.getAttribute('data-descricao');
    var anexoId = button.getAttribute('data-anexo-id');
    var anexoNome = button.getAttribute('data-anexo-nome');
    var hasAnexo = button.getAttribute('data-has-anexo') === '1';

        // Atualiza o conteúdo do modal
        var modalTitle = visualizarChamadoModal.querySelector('#modal-titulo');
        var modalDataAbertura = visualizarChamadoModal.querySelector('#modal-data-abertura');
        var modalSolicitanteNome = visualizarChamadoModal.querySelector('#modal-solicitante-nome');
        var modalSolicitanteEmail = visualizarChamadoModal.querySelector('#modal-solicitante-email');
        var modalSolicitanteRamal = visualizarChamadoModal.querySelector('#modal-solicitante-ramal');
        var modalStatus = visualizarChamadoModal.querySelector('#modal-status');
    var modalPrioridade = visualizarChamadoModal.querySelector('#modal-prioridade');
        var modalDescricao = visualizarChamadoModal.querySelector('#modal-descricao');
        var modalAnexoContainer = visualizarChamadoModal.querySelector('#modal-anexo-container');
        var modalAnexoLink = visualizarChamadoModal.querySelector('#modal-anexo-link');
        var modalAtenderBtn = visualizarChamadoModal.querySelector('#modal-atender-chamado-btn');

        modalTitle.textContent = titulo;
        modalDataAbertura.textContent = 'Aberto em: ' + dataAbertura;
        modalSolicitanteNome.textContent = solicitanteNome;
        modalSolicitanteEmail.textContent = solicitanteEmail;
        modalSolicitanteRamal.textContent = solicitanteRamal;
        modalStatus.textContent = status;
        if (modalPrioridade) {
            modalPrioridade.textContent = (prioridade && prioridade.trim()) ? prioridade : 'Não Classificada';
        }
        modalDescricao.textContent = descricao;

        // Lógica para exibir/ocultar o anexo
        if (hasAnexo && anexoNome) {
            modalAnexoContainer.style.display = 'block';
            modalAnexoLink.href = '/chamados/anexo/' + anexoId;
            modalAnexoLink.setAttribute('download', anexoNome);
        } else {
            modalAnexoContainer.style.display = 'none';
        }

        // Lógica para exibir/ocultar o botão "Atender Chamado"
        if (status === 'Aberto' || status === 'Em Atendimento') {
            modalAtenderBtn.classList.remove('d-none');
            modalAtenderBtn.href = '/chamados/atender/' + chamadoId;
        } else {
            modalAtenderBtn.classList.add('d-none');
        }
    });
});
