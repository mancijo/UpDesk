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
});