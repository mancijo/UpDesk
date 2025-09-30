// Local do arquivo: static/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // URL da sua nova API C#. Verifique a porta no seu Visual Studio!
    const apiUrl = 'https://localhost:7210'; 

    const loginForm = document.getElementById('loginForm');
    const mensagemDiv = document.getElementById('mensagem'); // Div para exibir erros

    // Adiciona um "escutador" para o evento de envio do formulário
    loginForm.addEventListener('submit', async (event) => {
        // 1. Impede o envio padrão do formulário, que recarregaria a página
        event.preventDefault(); 

        // 2. Pega os valores dos campos
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        // Limpa mensagens de erro antigas
        if (mensagemDiv) {
            mensagemDiv.innerText = '';
            mensagemDiv.style.color = 'red'; // Garante que a cor seja para erros
        }

        try {
            // 3. Faz a chamada para o endpoint de login da API C#
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

            // 4. Converte a resposta da API para JSON
            const data = await response.json();

            // 5. Verifica se a resposta foi um sucesso (status 2xx)
            if (response.ok) {
                console.log('Login bem-sucedido!', data);

                // 6. Após sucesso na API C#, cria a sessão no Flask
                try {
                    const flaskResponse = await fetch('/auth/session-login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data.usuario) // Envia os dados do usuário para o Flask
                    });

                    if (flaskResponse.ok) {
                        // 7. Redireciona para a página home somente após a sessão Flask ser criada
                        window.location.href = "/home";
                    } else {
                        const flaskError = await flaskResponse.json();
                        mensagemDiv.innerText = flaskError.mensagem || 'Erro ao iniciar sessão no servidor.';
                    }
                } catch (sessionError) {
                    console.error('Erro ao criar sessão no Flask:', sessionError);
                    mensagemDiv.innerText = 'Não foi possível conectar ao servidor da aplicação.';
                }
            } else {
                // Se a API retornou um erro (ex: 401 Unauthorized), exibe a mensagem
                if (mensagemDiv) {
                    mensagemDiv.innerText = data.mensagem || 'Email ou senha incorretos.';
                }
            }
        } catch (error) {
            // 7. Captura erros de conexão (ex: API C# está desligada)
            console.error('Erro de conexão:', error);
            if (mensagemDiv) {
                mensagemDiv.innerText = 'Não foi possível conectar ao servidor. Verifique se a API está em execução.';
            }
        }
    });
});