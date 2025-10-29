// Arquivo: static/js/login.js (Versão final corrigida)

document.addEventListener('DOMContentLoaded', () => {
    // Define a URL da API dinamicamente a partir do endereço da janela
    const apiUrl = window.location.origin; 

    const loginForm = document.getElementById('loginForm');
    const mensagemDiv = document.getElementById('mensagem');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        if (mensagemDiv) {
            mensagemDiv.innerText = '';
            mensagemDiv.style.color = 'red';
        }

        try {
            // Faz a chamada para o endpoint de login da API C#
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login bem-sucedido!', data);

                // Salva o token e os dados do usuário no localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                // Redireciona para a página home
                window.location.href = "/templates/home.html";
            } else {
                if (mensagemDiv) {
                    mensagemDiv.innerText = data.mensagem || 'Email ou senha incorretos.';
                }
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            if (mensagemDiv) {
                mensagemDiv.innerText = 'Não foi possível conectar ao servidor. Verifique se a API está em execução.';
            }
        }
    });

    // --- Forgot password handling ---
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const emailInput = document.getElementById('forgotEmail');
            const forgotMessage = document.getElementById('forgotMessage');
            const submitBtn = document.getElementById('forgotSubmit');
            const forgotConfirmation = document.getElementById('forgotConfirmation');

            if (!emailInput || !forgotMessage || !submitBtn || !forgotConfirmation) return;

            const email = emailInput.value.trim();
            if (!email) {
                forgotMessage.style.display = 'block';
                forgotMessage.classList.remove('text-success');
                forgotMessage.classList.add('text-danger');
                forgotMessage.innerText = 'Por favor, informe um e‑mail válido.';
                emailInput.focus();
                return;
            }

            // Simula envio: desabilita botão e substitui o formulário pelo cartão de confirmação.
            submitBtn.setAttribute('disabled', 'disabled');
            // esconder o form sem remover do DOM (para manter foco gerenciável)
            forgotForm.style.display = 'none';
            // mostrar a confirmação (card)
            forgotConfirmation.style.display = 'block';

            // coloca foco no botão de confirmação para acessibilidade
            const confirmBtn = document.getElementById('confirmBack');
            if (confirmBtn) confirmBtn.focus();
        });

        // Ao fechar o modal, limpar mensagens e formulário
        const forgotModalEl = document.getElementById('forgotModal');
        if (forgotModalEl) {
            // Quando o modal for fechado, restaurar o estado inicial
            forgotModalEl.addEventListener('hidden.bs.modal', () => {
                const emailInput = document.getElementById('forgotEmail');
                const forgotMessage = document.getElementById('forgotMessage');
                const submitBtn = document.getElementById('forgotSubmit');
                const forgotConfirmation = document.getElementById('forgotConfirmation');
                if (emailInput) emailInput.value = '';
                if (forgotMessage) {
                    forgotMessage.style.display = 'none';
                    forgotMessage.innerText = '';
                }
                if (submitBtn) submitBtn.removeAttribute('disabled');
                if (forgotConfirmation) forgotConfirmation.style.display = 'none';
                // mostra o form novamente para próxima vez
                if (forgotForm) forgotForm.style.display = '';
            });

            // handler do botão de confirmação: fecha modal e foca o campo de email do login
            const confirmBtn = document.getElementById('confirmBack');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    // fecha o modal via API do Bootstrap
                    const modalInstance = bootstrap.Modal.getInstance(forgotModalEl) || new bootstrap.Modal(forgotModalEl);
                    modalInstance.hide();
                    // volta o foco para o campo de email da tela de login
                    const loginEmail = document.getElementById('email');
                    if (loginEmail) setTimeout(() => loginEmail.focus(), 200);
                });
            }
        }
    }
});