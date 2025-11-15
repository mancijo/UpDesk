let CHAMADO_ID;
let CURRENT_USER_ID;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    CHAMADO_ID = params.get('id');

    const user = JSON.parse(localStorage.getItem('usuario'));
    CURRENT_USER_ID = user ? user.id : null;

    /*if (!CHAMADO_ID || !CURRENT_USER_ID) {
        document.body.innerHTML = '<div class="alert alert-danger">Erro: ID do chamado ou do usuário não encontrado. Volte e tente novamente.</div>';
        return;
    }*/

    fetchChamadoDetails(CHAMADO_ID);
    loadChatMessages(CHAMADO_ID);

    // Event Listeners
    document.getElementById('form-enviar-mensagem').addEventListener('submit', handleSendMessage);
    document.getElementById('encerrar-btn').addEventListener('click', handleEncerrarChamado);
    // Transferir
    const transferBtn = document.getElementById('transferir-btn');
    if (transferBtn) transferBtn.addEventListener('click', handleTransferirChamado);

    // Wire transfer modal confirm button
    const transferConfirmBtn = document.getElementById('transferirConfirmBtn');
    if (transferConfirmBtn) {
        transferConfirmBtn.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const select = document.getElementById('tecnico-select');
            const errorEl = document.getElementById('transferirError');
            if (!select) return;
            const novoId = select.value;
            errorEl.style.display = 'none';

            // validar número
            if (!novoId) {
                errorEl.textContent = 'Por favor, selecione um técnico para a transferência.';
                errorEl.style.display = 'block';
                select.focus();
                return;
            }

            // confirma e chama a API
            try {
                transferConfirmBtn.setAttribute('disabled', 'disabled');
                const response = await fetchWithAuth(`/api/chamados/${CHAMADO_ID}/transferir`, {
                    method: 'POST',
                    body: JSON.stringify({ NovoAtendenteId: Number(novoId) })
                });

                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(txt || 'Falha ao transferir o chamado.');
                }

                // success: fechar modal e atualizar
                const modalEl = document.getElementById('transferirChamadoModal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
                alert('Chamado transferido com sucesso.');
                await fetchChamadoDetails(CHAMADO_ID);
            } catch (err) {
                console.error('Erro ao transferir:', err);
                const txt = err && err.message ? err.message : 'Erro ao transferir.';
                const errorEl2 = document.getElementById('transferirError');
                if (errorEl2) {
                    errorEl2.textContent = txt;
                    errorEl2.style.display = 'block';
                } else {
                    alert(txt);
                }
            } finally {
                transferConfirmBtn.removeAttribute('disabled');
            }
        });
    }
});



/**
 * Busca os detalhes do chamado e preenche a coluna da esquerda.
 */
async function fetchChamadoDetails(id) {
    try {
        // ATENÇÃO: Crie o endpoint GET /api/chamados/{id} no backend
        const response = await fetchWithAuth(`/api/chamados/${id}`);
        if (!response.ok) throw new Error('Chamado não encontrado');
        const chamado = await response.json();

        document.getElementById('chamado-id').textContent = chamado.chamadoId;
        document.getElementById('chamado-titulo').textContent = chamado.tituloChamado;
        document.getElementById('chamado-data-abertura').textContent = new Date(chamado.dataAbertura).toLocaleString('pt-BR');
        document.getElementById('chamado-solicitante-nome').textContent = chamado.solicitanteNome || 'N/A';
        document.getElementById('chamado-solicitante-email').textContent = chamado.solicitanteEmail || 'N/A';
        document.getElementById('chamado-solicitante-ramal').textContent = chamado.solicitanteTelefone || 'N/A';
        document.getElementById('chamado-status').textContent = chamado.statusChamado;
        document.getElementById('chamado-prioridade').textContent = chamado.prioridadeChamado;
        document.getElementById('chamado-categoria').textContent = chamado.categoriaChamado;
        document.getElementById('chamado-descricao').textContent = `"${chamado.descricaoChamado}"`;

    } catch (error) {
        console.error('Falha ao buscar detalhes do chamado:', error);
        document.querySelector('.ticket-data').innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

// --- LÓGICA DO CHAT (Adaptada do script original) ---

/**
 * Busca as mensagens do chat do chamado na API.
 */
async function loadChatMessages(chamadoId) {
    const chatMessages = document.getElementById('chat-messages');
    try {
    // ATENÇÃO: Crie o endpoint GET /api/chamados/{id}/mensagens no backend
    const response = await fetchWithAuth(`/api/chamados/${chamadoId}/mensagens`);
        if (!response.ok) {
            // tentar ler corpo de erro para debugging
            let errText = '';
            try { errText = await response.text(); } catch (e) { /* ignore */ }
            console.error('Server error loading messages', response.status, errText);
            throw new Error(`Falha ao carregar mensagens. (${response.status}) ${errText}`);
        }
        const mensagens = await response.json();
        
        chatMessages.innerHTML = ''; // Limpa o spinner

        if (mensagens.length === 0) {
            chatMessages.innerHTML = '<p class="text-center text-muted">Nenhuma mensagem ainda. Inicie a conversa!</p>';
        } else {
            mensagens.forEach(renderChatMessage);
        }
        scrollChatToBottom();
    } catch (error) {
        console.error('Erro:', error);
        const msg = error && error.message ? error.message : 'Não foi possível carregar o chat.';
        chatMessages.innerHTML = `<p class="text-center text-danger">${msg}</p>`;
    }
}

/**
 * Manipula o envio de uma nova mensagem.
 */
async function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('input-mensagem');
    const mensagemTexto = input.value.trim();

    if (mensagemTexto) {
        try {
            // ATENÇÃO: Crie o endpoint POST /api/chamados/{id}/mensagens no backend
            const payload = { UsuarioId: CURRENT_USER_ID, Mensagem: mensagemTexto };
            const response = await fetchWithAuth(`/api/chamados/${CHAMADO_ID}/mensagens`, {
                method: 'POST',
                body: payload,
            });

            if (response.ok) {
                input.value = '';
                await loadChatMessages(CHAMADO_ID);
            } else {
                let txt = 'Erro ao enviar mensagem.';
                try { txt = await response.text(); } catch (e) { /* ignore */ }
                alert(txt || 'Erro ao enviar mensagem.');
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    }
}

/**
 * Renderiza uma única mensagem na tela do chat.
 */
function renderChatMessage(msg) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const authorSpan = document.createElement('span');
    const bubbleDiv = document.createElement('div');

    authorSpan.className = 'author';
    // Os campos chegam em camelCase: usuarioNome, dataCriacao, mensagem, usuarioId
    const author = msg.usuarioNome || msg.usuarioNome || 'Usuário';
    const dateStr = msg.dataCriacao ? new Date(msg.dataCriacao).toLocaleString('pt-BR') : '';
    authorSpan.textContent = `${author}${dateStr ? ' - ' + dateStr : ''}`;

    bubbleDiv.className = 'bubble';
    bubbleDiv.textContent = msg.mensagem || msg.Mensagem || '';

    messageDiv.className = 'message';
    // comparar como números/string de forma robusta
    if (String(msg.usuarioId) === String(CURRENT_USER_ID)) {
        messageDiv.classList.add('sent');
    } else {
        messageDiv.classList.add('received');
    }

    messageDiv.appendChild(authorSpan);
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- LÓGICA DAS AÇÕES ---

/**
 * Manipula o clique no botão de encerrar chamado.
 */
async function handleEncerrarChamado() {
    if (confirm('Tem certeza que deseja encerrar este chamado?')) {
        try {
            // ATENÇÃO: Crie o endpoint PUT /api/chamados/{id}/status no backend
            const response = await fetchWithAuth(`/api/chamados/${CHAMADO_ID}/status`, {
                method: 'PUT',
                body: JSON.stringify({ NovoStatus: 'Resolvido' })
            });
            if (!response.ok) throw new Error('Falha ao encerrar o chamado.');

            alert('Chamado encerrado com sucesso!');
            // Atualiza o status na tela
            document.getElementById('chamado-status').textContent = 'Resolvido';
            const statusEl = document.getElementById('chamado-status');
            statusEl.textContent = 'Resolvido';
            statusEl.className = 'badge bg-success';
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }
}

/**
 * Transferir chamado para outro atendente (prompt simples).
 * Melhorar futuramente para exibir um modal com lista de técnicos.
 */
async function handleTransferirChamado() {
    const modalEl = document.getElementById('transferirChamadoModal');
    if (!modalEl) return;

    // Reset form
    const select = document.getElementById('tecnico-select');
    const errorEl = document.getElementById('transferirError');
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

    // Popular o select com os técnicos
    if (select) {
        select.innerHTML = '<option value="" selected disabled>Carregando...</option>';
        try {
            // ATENÇÃO: Crie o endpoint GET /api/usuarios/tecnicos no backend
            const response = await fetchWithAuth('/api/usuarios/tecnicos');
            if (!response.ok) throw new Error('Falha ao carregar técnicos.');
            
            const tecnicos = await response.json();
            
            select.innerHTML = '<option value="" selected disabled>Selecione um técnico</option>';
            tecnicos.forEach(tecnico => {
                // Evitar que o técnico atual apareça na lista para não transferir para si mesmo
                if (tecnico.id !== CURRENT_USER_ID) {
                    const option = new Option(tecnico.nome, tecnico.id);
                    select.add(option);
                }
            });
        } catch (error) {
            console.error('Erro ao buscar técnicos:', error);
            select.innerHTML = '<option value="" selected disabled>Erro ao carregar</option>';
            errorEl.textContent = 'Não foi possível carregar a lista de técnicos.';
            errorEl.style.display = 'block';
        }
    }

    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}
