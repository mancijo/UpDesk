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
        var categoria = button.getAttribute('data-categoria');
        var descricao = button.getAttribute('data-descricao');
        var anexoBase64 = button.getAttribute('data-anexo');
        var anexoNome = button.getAttribute('data-anexo-nome');

        // Atualiza o conteúdo do modal
        var modalTitle = visualizarChamadoModal.querySelector('#modal-titulo');
        var modalDataAbertura = visualizarChamadoModal.querySelector('#modal-data-abertura');
        var modalSolicitanteNome = visualizarChamadoModal.querySelector('#modal-solicitante-nome');
        var modalSolicitanteEmail = visualizarChamadoModal.querySelector('#modal-solicitante-email');
        var modalSolicitanteRamal = visualizarChamadoModal.querySelector('#modal-solicitante-ramal');
        var modalStatus = visualizarChamadoModal.querySelector('#modal-status');
        var modalCategoria = visualizarChamadoModal.querySelector('#modal-categoria');
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
        modalCategoria.textContent = categoria;
        modalDescricao.textContent = descricao;

        // Lógica para exibir/ocultar o anexo
        if (anexoBase64 && anexoNome) {
            modalAnexoContainer.style.display = 'block';
            // Cria um Blob a partir do base64 e gera um URL para download
            var byteCharacters = atob(anexoBase64);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], { type: 'application/octet-stream' }); // Tipo genérico
            var url = URL.createObjectURL(blob);
            modalAnexoLink.href = url;
            modalAnexoLink.download = anexoNome; // Define o nome do arquivo para download
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
