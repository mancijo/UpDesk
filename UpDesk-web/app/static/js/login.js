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
            
            // Seleciona elementos para feedback do usuário
            const mensagem = document.getElementById('mensagem');
            const submitButton = loginForm.querySelector('button[type="submit"]');

            // --- Início do Feedback Visual ---
            // Desabilita o botão para prevenir múltiplos envios e muda o texto para indicar carregamento.
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
            mensagem.innerText = ''; // Limpa mensagens de erro anteriores

            // O bloco try...catch...finally garante que o botão seja reativado mesmo se ocorrer um erro.
            try {
                // Envia a requisição para o backend usando a API Fetch
                const resposta = await fetch(loginUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Informa ao backend que estamos enviando JSON
                    },
                    body: JSON.stringify({ email, senha }) // Converte os dados do formulário para o formato JSON
                });

                // Converte a resposta do backend (que também é JSON) para um objeto JavaScript
                const dados = await resposta.json();

                // Verifica se a requisição foi bem-sucedida (status HTTP 2xx)
                if (resposta.ok) {
                    // Em caso de sucesso, restaura o botão e DEPOIS redireciona
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Login';
                    window.location.href = "/home";
                } else {
                    // Se o backend retornar um erro (ex: senha incorreta), exibe a mensagem de erro
                    mensagem.style.color = 'red';
                    mensagem.innerText = dados.mensagem || 'Ocorreu um erro.';
                    // Restaura o botão em caso de falha de login
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Login';
                }
            } catch (error) {
                // Captura erros de rede (ex: servidor offline)
                console.error('Erro de rede ou ao fazer login:', error);
                mensagem.style.color = 'red';
                mensagem.innerText = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
                // Restaura o botão em caso de erro de rede
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
            }
        });
    }
});
