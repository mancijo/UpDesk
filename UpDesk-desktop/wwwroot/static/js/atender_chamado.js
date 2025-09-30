// /static/js/atender_chamado.js

let CHAMADO_ID;
let CURRENT_USER_ID;

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    CHAMADO_ID = params.get('id');

    const user = JSON.parse(localStorage.getItem('usuario'));
    CURRENT_USER_ID = user ? user.id : null;

    if (!CHAMADO_ID || !CURRENT_USER_ID) {
        document.body.innerHTML = '<div class="alert alert-danger">Erro: ID do chamado ou do usuário não encontrado. Volte e tente novamente.</div>';
        return;
    }

    fetchChamadoDetails(CHAMADO_ID);
    loadChatMessages(CHAMADO_ID);

    // Event Listeners
    document.getElementById('form-enviar-mensagem').addEventListener('submit', handleSendMessage);
    document.getElementById('encerrar-btn').addEventListener('click', handleEncerrarChamado);
    // A lógica de transferência será adicionada se houver um botão/modal para isso.
});

/**
 * Busca os detalhes do chamado e preenche a coluna da esquerda.
 */
async function fetchChamadoDetails(id) {
    try {
        // ATENÇÃO: Crie o endpoint GET /api/chamados/{id} no backend
        const response = await fetchWithAuth(`${apiUrl}/api/chamados/${id}`);
        if (!response.ok) throw new Error('Chamado não encontrado');
        const chamado = await response.json();

        document.getElementById('chamado-id').textContent = chamado.chamadoId;
        document.getElementById('chamado-titulo').textContent = chamado.tituloChamado;
        document.getElementById('chamado-data-abertura').textContent = new Date(chamado.dataAbertura).toLocaleString('pt-BR');
        document.getElementById('chamado-solicitante-nome').textContent = chamado.solicitante?.nome || 'N/A';
        document.getElementById('chamado-solicitante-email').textContent = chamado.solicitante?.email || 'N/A';
        document.getElementById('chamado-solicitante-ramal').textContent = chamado.solicitante?.telefone || 'N/A';
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
        const response = await fetchWithAuth(`${apiUrl}/api/chamados/${chamadoId}/mensagens`);
        if (!response.ok) throw new Error('Falha ao carregar mensagens.');
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
        chatMessages.innerHTML = '<p class="text-center text-danger">Não foi possível carregar o chat.</p>';
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
            const response = await fetchWithAuth(`${apiUrl}/api/chamados/${CHAMADO_ID}/mensagens`, {
                method: 'POST',
                body: JSON.stringify({ mensagem: mensagemTexto }),
            });

            if (response.ok) {
                input.value = '';
                await loadChatMessages(CHAMADO_ID);
            } else {
                alert('Erro ao enviar mensagem.');
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
    authorSpan.textContent = `${msg.usuarioNome} - ${new Date(msg.dataCriacao).toLocaleString('pt-BR')}`;

    bubbleDiv.className = 'bubble';
    bubbleDiv.textContent = msg.mensagem;

    messageDiv.className = 'message';
    if (msg.usuarioId === CURRENT_USER_ID) {
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
            const response = await fetchWithAuth(`${apiUrl}/api/chamados/${CHAMADO_ID}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Resolvido' })
            });
            if (!response.ok) throw new Error('Falha ao encerrar o chamado.');

            alert('Chamado encerrado com sucesso!');
            // Atualiza o status na tela
            document.getElementById('chamado-status').textContent = 'Resolvido';
            document.getElementById('chamado-status').className = 'badge bg-success';
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }
}
