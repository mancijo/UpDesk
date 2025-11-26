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
        var formReabrir = visualizarChamadoModal.querySelector('#form-reabrir-chamado');

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

        // Lógica de reabertura para usuário solicitante quando resolvido
        if (formReabrir) {
            formReabrir.classList.add('d-none');
            var currentUserId = visualizarChamadoModal.getAttribute('data-current-user-id') || '';
            var solicitanteId = button.getAttribute('data-solicitante-id') || '';
            if (status === 'Resolvido' && currentUserId && solicitanteId && String(currentUserId) === String(solicitanteId)) {
                formReabrir.action = '/chamados/reabrir/' + chamadoId;
                formReabrir.classList.remove('d-none');
            }
        }

        // Histórico de interações (exibido após o encerramento)
        var historicoContainer = visualizarChamadoModal.querySelector('#modal-historico-container');
        var historicoList = visualizarChamadoModal.querySelector('#modal-historico-list');
        var historicoEmpty = visualizarChamadoModal.querySelector('#modal-historico-empty');
        // Limpa
        if (historicoList) historicoList.innerHTML = '';
        if (historicoEmpty) historicoEmpty.style.display = 'none';
        if (historicoContainer) historicoContainer.style.display = 'none';

        // Carregar histórico somente quando resolvido
        if (status === 'Resolvido') {
            if (historicoContainer) historicoContainer.style.display = 'block';
            fetch('/chamados/api/' + chamadoId + '/mensagens', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })
            .then(function(res){ return res.ok ? res.json() : []; })
            .then(function(mensagens){
                if (!mensagens || mensagens.length === 0) {
                    if (historicoEmpty) historicoEmpty.style.display = 'block';
                    return;
                }
                mensagens.forEach(function(m){
                    var li = document.createElement('div');
                    li.className = 'list-group-item';
                    var top = document.createElement('div');
                    top.className = 'd-flex justify-content-between';
                    var author = document.createElement('div');
                    author.innerHTML = '<strong>' + (m.usuario_nome || ('Usuário ' + (m.usuario_id || ''))) + '</strong>';
                    var date = document.createElement('div');
                    date.className = 'text-muted small';
                    date.textContent = m.data_criacao || '';
                    top.appendChild(author);
                    top.appendChild(date);
                    var body = document.createElement('div');
                    body.className = 'mt-2';
                    body.textContent = m.mensagem || '';
                    li.appendChild(top);
                    li.appendChild(body);
                    if (historicoList) historicoList.appendChild(li);
                });
            })
            .catch(function(err){
                if (historicoEmpty) {
                    historicoEmpty.textContent = 'Falha ao carregar histórico.';
                    historicoEmpty.style.display = 'block';
                }
            });
        }
    });
});
