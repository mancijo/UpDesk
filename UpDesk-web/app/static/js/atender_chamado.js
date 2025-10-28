document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.querySelector('.chat-container');
    const chamadoId = chatContainer.dataset.chamadoId;
    const currentUserId = chatContainer.dataset.userId;
    const chatMessages = document.getElementById('chat-messages');
    const form = document.getElementById('form-enviar-mensagem');
    const input = document.getElementById('input-mensagem');

    // Função para rolar o chat para a última mensagem
    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Função para renderizar uma mensagem na tela
    function renderizarMensagem(msg) {
        const messageDiv = document.createElement('div');
        const authorSpan = document.createElement('span');
        const bubbleDiv = document.createElement('div');

        // Define o autor e a data
        authorSpan.className = 'author';
        authorSpan.textContent = `${msg.usuario_nome} - ${msg.data_criacao}`;

        // Define o balão da mensagem
        bubbleDiv.className = 'bubble';
        bubbleDiv.textContent = msg.mensagem;

        // Define a classe principal da mensagem (enviada ou recebida)
        messageDiv.className = 'message';
        if (msg.usuario_id === parseInt(currentUserId)) {
            messageDiv.classList.add('sent');
        } else {
            messageDiv.classList.add('received');
        }

        messageDiv.appendChild(authorSpan);
        messageDiv.appendChild(bubbleDiv);
        chatMessages.appendChild(messageDiv);
    }

    // Função para carregar as mensagens do chamado
    async function carregarMensagens() {
        try {
            const response = await fetch(`/chamados/api/${chamadoId}/mensagens`);
            if (!response.ok) {
                throw new Error('Falha ao carregar mensagens.');
            }
            const mensagens = await response.json();
            
            // Limpa a área de mensagens (removendo o spinner de "carregando")
            chatMessages.innerHTML = '';

            if (mensagens.length === 0) {
                chatMessages.innerHTML = '<p class="text-center text-muted">Nenhuma mensagem ainda. Inicie a conversa!</p>';
            } else {
                mensagens.forEach(renderizarMensagem);
            }
            scrollChatToBottom();
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            chatMessages.innerHTML = '<p class="text-center text-danger">Não foi possível carregar o chat. Verifique o console para detalhes.</p>';
        }
    }

    // Função para enviar uma nova mensagem
    async function enviarMensagem(e) {
        e.preventDefault(); // Impede o recarregamento da página
        const mensagemTexto = input.value.trim();

        if (mensagemTexto) {
            try {
                const response = await fetch(`/api/${chamadoId}/mensagens`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mensagem: mensagemTexto }),
                });

                if (response.ok) {
                    input.value = ''; // Limpa o campo de texto
                    await carregarMensagens(); // Recarrega as mensagens para exibir a nova
                } else {
                    alert('Erro ao enviar mensagem.');
                }
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    }

    // Event Listeners
    if (form) {
        form.addEventListener('submit', enviarMensagem);
    }
    
    // Carrega as mensagens iniciais e depois atualiza a cada 5 segundos
    if(chamadoId) {
        carregarMensagens();
        setInterval(carregarMensagens, 5000);
    }
});
