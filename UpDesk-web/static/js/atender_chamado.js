document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const formEnviarMensagem = document.getElementById('form-enviar-mensagem');
    const inputMensagem = document.getElementById('input-mensagem');
    const chatContainer = document.querySelector('.chat-container');

    const chamadoId = chatContainer.dataset.chamadoId;
    const userId = chatContainer.dataset.userId;

    function carregarMensagens() {
        fetch(`/chamados/api/${chamadoId}/mensagens`)
            .then(response => response.json())
            .then(mensagens => {
                chatMessages.innerHTML = ''; // Limpa mensagens existentes
                mensagens.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-message');
                    if (msg.usuario_id == userId) {
                        messageElement.classList.add('chat-message--sent');
                    } else {
                        messageElement.classList.add('chat-message--received');
                    }
                    messageElement.innerHTML = `
                        <strong>${msg.usuario_nome}:</strong> ${msg.mensagem}
                        <span class="chat-timestamp">${msg.data_criacao}</span>
                    `;
                    chatMessages.appendChild(messageElement);
                });
                chatMessages.scrollTop = chatMessages.scrollHeight; // Rola para a última mensagem
            })
            .catch(error => console.error('Erro ao carregar mensagens:', error));
    }

    formEnviarMensagem.addEventListener('submit', function(event) {
        event.preventDefault();
        const mensagem = inputMensagem.value.trim();

        if (mensagem) {
            fetch(`/chamados/api/${chamadoId}/mensagens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mensagem: mensagem })
            })
            .then(response => response.json())
            .then(data => {
                if (data.mensagem) {
                    inputMensagem.value = ''; // Limpa o input
                    carregarMensagens(); // Recarrega as mensagens para incluir a nova
                } else if (data.erro) {
                    console.error('Erro ao enviar mensagem:', data.erro);
                    alert('Erro ao enviar mensagem: ' + data.erro);
                }
            })
            .catch(error => {
                console.error('Erro na requisição de envio:', error);
                alert('Erro na requisição de envio de mensagem.');
            });
        }
    });

    // Carrega as mensagens ao iniciar e a cada 5 segundos
    carregarMensagens();
    setInterval(carregarMensagens, 5000);
});