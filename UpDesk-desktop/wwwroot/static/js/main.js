// /static/js/main.js

// Define a URL base da API como a origem da janela atual.
const apiUrl = window.location.origin;

document.addEventListener("DOMContentLoaded", function() {
    // Carrega a barra de navegação e verifica a autenticação ao carregar a página.
    loadNavbar();
});

function loadNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        fetch('/templates/navbar.html')
            .then(response => response.text())
            .then(html => {
                navbarPlaceholder.innerHTML = html;
                // Após a navbar ser carregada, atualiza seu conteúdo dinâmico.
                updateNavbar();
            })
            .catch(error => {
                console.error('Erro ao carregar a navbar:', error);
                if (navbarPlaceholder) {
                    navbarPlaceholder.innerHTML = '<p>Erro ao carregar o menu.</p>';
                }
            });
    }
}

function updateNavbar() {
    try {
        const userData = JSON.parse(localStorage.getItem('usuario'));
        const usernameElement = document.getElementById('navbar-username');
        const logoutButton = document.getElementById('logout-button');

        if (userData && userData.nome) {
            if (usernameElement) {
                usernameElement.textContent = userData.nome;
            }
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                // Limpa os dados de autenticação do localStorage.
                localStorage.removeItem('authToken');
                localStorage.removeItem('usuario');
                // Redireciona para a página de login.
                window.location.href = '/templates/login.html';
            });
        }
    } catch (e) {
        console.error("Erro ao processar dados do usuário:", e);
        // Se houver erro nos dados do localStorage, limpa e redireciona para o login.
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/templates/login.html';
    }
}


/**
 * Função auxiliar para fazer chamadas à API com o token de autenticação.
 * @param {string} endpoint O endpoint da API para o qual fazer a chamada (ex: '/api/chamados').
 * @param {object} options As opções para a chamada fetch (method, body, etc.).
 * @returns {Promise<Response>} A resposta da chamada fetch.
 */
async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Adiciona o token de autorização se ele existir.
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: headers,
    });

    // Se a resposta for 401 (Não Autorizado), o token é inválido ou expirou.
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        window.location.href = '/templates/login.html';
        // Lança um erro para interromper a execução do código que chamou a função.
        throw new Error('Não autorizado');
    }

    return response;
}