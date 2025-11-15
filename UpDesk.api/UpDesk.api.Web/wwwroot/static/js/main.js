// /static/js/main.js

document.addEventListener("DOMContentLoaded", function() {
    // Carrega a navbar e, QUANDO TERMINAR, atualiza a interface com o usuário logado
    loadNavbar().then(() => {
        const storedUser = JSON.parse(localStorage.getItem('usuario'));

        if (storedUser) {
            console.log("Usuário carregado do localStorage:", storedUser);
            updateUIAfterLogin(storedUser);
        } else {
            console.warn("Nenhum usuário encontrado no localStorage. Redirecionando para login...");
            window.location.href = "/templates/index.html";
        }
    });
});

/**
 * Carrega o HTML da navbar de forma assíncrona.
 * Retorna uma Promise que resolve quando a navbar é inserida na página.
 */
function loadNavbar() {
    return new Promise((resolve, reject) => {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (navbarPlaceholder) {
            fetch('/templates/navbar.html')
                .then(response => response.text())
                .then(html => {
                    navbarPlaceholder.innerHTML = html;
                    // Carrega o script da navbar para funcionalidades como o highlight do link ativo.
                    const existingScript = document.querySelector('script[data-script="navbar"]');
                    if (!existingScript) {
                        const script = document.createElement('script');
                        script.src = '/static/js/navbar.js';
                        script.dataset.script = 'navbar'; // Marca o script para não ser carregado novamente
                        document.body.appendChild(script);
                    }
                    resolve(); // A navbar foi carregada com sucesso.
                })
                .catch(error => {
                    console.error('Erro ao carregar a navbar:', error);
                    navbarPlaceholder.innerHTML = '<p>Erro ao carregar o menu.</p>';
                    reject(error);
                });
        } else {
            resolve(); // Se não houver placeholder, apenas resolve.
        }
    });
}

/**
 * Atualiza a interface do usuário (nome, visibilidade de menus, etc.) com base nos dados de login.
 * Esta função deve ser chamada APÓS a navbar estar no DOM.
 */
function updateUIAfterLogin(userData) {
    const userRole = userData && userData.cargo ? userData.cargo.trim() : null;
    const userName = userData && userData.nome ? userData.nome : 'Usuário';

    // Atualiza nome do usuário no topo
    const navbarUsername = document.getElementById('navbar-username');
    if (navbarUsername) navbarUsername.textContent = userName;

    console.log(`UI UPDATE: Atualizando interface para '${userName}' (${userRole})`);

    // =========================
    // 🔗 Referências aos botões do menu
    // =========================
    const navHome = document.getElementById('nav-home');
    const navMonitoramento = document.getElementById('nav-monitoramento');
    const navTriagem = document.getElementById('nav-triagem');
    const navGerenciamento = document.getElementById('nav-gerenciamento');
    const navChamado = document.getElementById('nav-chamado');
    const navAtender = document.getElementById('nav-atender');
    const navPerfil = document.getElementById('nav-perfil');
    const navMeusChamados = document.getElementById('nav-meuschamados');

    // Primeiro, oculta tudo (assim garantimos que ninguém herda o que não deve)
    const allNavs = [
        navHome, navMonitoramento, navTriagem,
        navGerenciamento, navChamado, navAtender,
        navPerfil, navMeusChamados
    ];
    allNavs.forEach(item => { if (item) item.style.display = 'none'; });

    // =========================
    //  Lógica de hierarquia
    // =========================
    switch (userRole) {
        case 'Supervisor':
            // Supervisor tem acesso total
            allNavs.forEach(item => { if (item) item.style.display = 'block'; });
            break;

        case 'Tecnico N1':
        case 'Tecnico N2':
            // Técnicos podem triagem, atender, abrir e ver chamados
            if (navHome) navHome.style.display = 'block';
            if (navMonitoramento) navMonitoramento.style.display = 'block';
            if (navTriagem) navTriagem.style.display = 'block';
            if (navAtender) navAtender.style.display = 'block';
            if (navChamado) navChamado.style.display = 'block';
            if (navMeusChamados) navMeusChamados.style.display = 'block';
            if (navPerfil) navPerfil.style.display = 'block';
            break;

        case 'Triagem':
            // Triagem pode monitorar, triagem, abrir e ver chamados
            if (navHome) navHome.style.display = 'block';
            if (navMonitoramento) navMonitoramento.style.display = 'block';
            if (navTriagem) navTriagem.style.display = 'block';
            if (navChamado) navChamado.style.display = 'block';
            if (navMeusChamados) navMeusChamados.style.display = 'block';
            if (navPerfil) navPerfil.style.display = 'block';
            break;

        case 'Auxiliar administrativo':
            // Aux. administrativo -> só pode abrir chamado e ver os dele
            if (navHome) navHome.style.display = 'block';
            if (navChamado) navChamado.style.display = 'block';
            if (navMeusChamados) navMeusChamados.style.display = 'block';
            if (navPerfil) navPerfil.style.display = 'block';
            break;

        default:
            console.warn(`UI UPDATE: Cargo '${userRole}' não reconhecido — sem permissões.`);
            break;
    }

    console.log(`UI UPDATE: Interface carregada com permissões para '${userRole}' ✅`);
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

    // Usa a origem da janela atual (http://localhost:PORTA) como base.
    // Isso torna a URL da API dinâmica e resolve o problema da porta.
    const baseUrl = window.location.origin;
    const url = new URL(endpoint, baseUrl).href;

    // Se o body for um objeto, stringify aqui para evitar formatações incorretas
    const finalOptions = { ...options, headers: headers };
    if (finalOptions.body && typeof finalOptions.body === 'object') {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }

    const response = await fetch(url, finalOptions);

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