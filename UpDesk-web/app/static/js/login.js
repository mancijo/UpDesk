/**
 * Script para a Página de Login
 *
 * Responsabilidade:
 * - Capturar o envio do formulário de login.
 * - Enviar os dados de email e senha para o backend de forma assíncrona (AJAX/Fetch).
 * - Lidar com a resposta do backend para redirecionar o usuário em caso de sucesso ou exibir uma mensagem de erro.
 * - Fornecer feedback visual durante o processo (desabilitar o botão e mostrar um spinner).
 */
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona o formulário de login no DOM
    const loginForm = document.getElementById('loginForm');
    const mensagem = document.getElementById('mensagem');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    // Constantes para mensagens e estados do botão
    const MSG_ERROR_NETWORK = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    const MSG_ERROR_GENERIC = 'Ocorreu um erro.';
    const BTN_TEXT_LOGIN = 'Login';
    const BTN_TEXT_LOADING = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';

    /**
     * Exibe uma mensagem para o usuário.
     * @param {string} text - O texto da mensagem.
     * @param {string} type - O tipo da mensagem ('success' ou 'error').
     */
    function displayMessage(text, type) {
        mensagem.innerText = text;
        mensagem.style.color = type === 'error' ? 'red' : 'green';
    }

    /**
     * Define o estado de carregamento do botão de submit.
     * @param {boolean} isLoading - Se o botão deve estar em estado de carregamento.
     */
    function setLoadingState(isLoading) {
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.innerHTML = isLoading ? BTN_TEXT_LOADING : BTN_TEXT_LOGIN;
        }
    }

    // Garante que o script só execute se o formulário de login existir na página
    if (loginForm) {
        // Obtém a URL de login a partir do atributo data-login-url do formulário.
        // Esta é uma boa prática para desacoplar o JavaScript das URLs do Flask.
        const loginUrl = loginForm.dataset.loginUrl;

        // Adiciona um "escutador" para o evento de submit do formulário
        loginForm.addEventListener('submit', async function (event) {
            // Previne o comportamento padrão do formulário (que seria recarregar a página)
            event.preventDefault();

            // Coleta os valores dos campos de email e senha
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            
            // Limpa mensagens de erro anteriores
            displayMessage('', 'success'); 

            // --- Validação no Cliente ---
            if (!email || !senha) {
                displayMessage('Por favor, preencha todos os campos.', 'error');
                return; // Impede o envio do formulário se a validação falhar
            }

            // --- Início do Feedback Visual ---
            setLoadingState(true);

            // O bloco try...catch...finally garante que o botão seja reativado mesmo se ocorrer um erro.
            try {
                // Envia a requisição para o backend usando a API Fetch
                // Captura token CSRF gerado pelo Flask-WTF para envio manual na requisição JSON
                const csrfInput = document.querySelector('input[name="csrf_token"]');
                const csrfToken = csrfInput ? csrfInput.value : null;

                const headers = {
                    'Content-Type': 'application/json'
                };
                if (csrfToken) {
                    // Flask-WTF aceita cabeçalhos 'X-CSRFToken'
                    headers['X-CSRFToken'] = csrfToken;
                }

                const resposta = await fetch(loginUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers,
                    body: JSON.stringify({ email, senha })
                });

                // Converte a resposta do backend (que também é JSON) para um objeto JavaScript
                // Tenta parsear JSON com fallback silencioso
                let dados = {};
                try {
                    dados = await resposta.json();
                } catch (e) {
                    // Se não vier JSON, mantém objeto vazio
                }

                // Verifica se a requisição foi bem-sucedida (status HTTP 2xx)
                if (resposta.ok) {
                    // Em caso de sucesso, redireciona
                    window.location.href = "/home";
                } else {
                    // Se o backend retornar um erro (ex: senha incorreta), exibe a mensagem de erro
                    displayMessage(dados.mensagem || MSG_ERROR_GENERIC, 'error');
                }
            } catch (error) {
                // Captura erros de rede (ex: servidor offline)
                console.error('Erro de rede ou ao fazer login:', error);
                displayMessage(MSG_ERROR_NETWORK, 'error');
            } finally {
                // Restaura o botão em qualquer caso (sucesso, falha de login, erro de rede)
                setLoadingState(false);
            }
        });
    }
});
