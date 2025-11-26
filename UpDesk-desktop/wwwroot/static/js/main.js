// /static/js/main.js

document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();

    const user = JSON.parse(localStorage.getItem("usuario"));

    if (!user) {
        console.warn("Nenhum usuário logado. Redirecionando para login...");
        window.location.href = "/templates/index.html";
        return;
    }

    UI.updateInterface(user);
    UI.safeRedirect(user);

    
});

/* ==========================================================
    SISTEMA DE PAPÉIS / PERMISSÕES
   ========================================================== */

const ROLE_CONFIG = {
    "Supervisor": {
        home: "/templates/home_supervisor.html",
        allowedNavs: [
            "nav-home", ,"nav-monitoramento", "nav-triagem",
            "nav-gerenciamento", "nav-chamado", "nav-atender",
            , "nav-meuschamados", "nav-perfil"
        ]
    },

    "Tecnico N1": {
        home: "/templates/home_tecnicos.html",
        allowedNavs: [
            "nav-home", "nav-perfil", "nav-monitoramento",
            "nav-chamado", "nav-meuschamados", "nav-atender"
            
        ]
    },

    "Tecnico N2": {
        home: "/templates/home_tecnicos.html",
        allowedNavs: [
            "nav-home", "nav-monitoramento", "nav-triagem",
            "nav-atender", "nav-chamado", "nav-meuschamados",
            "nav-perfil"
        ]
    },

    "Triagem": {
        home: "/templates/home_triagem.html",
        allowedNavs: [
            "nav-perfil", "nav-home", "nav-monitoramento", "nav-triagem",
            "nav-chamado", "nav-meuschamados", "nav-atender"

        ]
    },

    "Auxiliar Administrativo": {
        home: "/templates/home_usuario.html",
        allowedNavs: [
            "nav-home", "nav-chamado",
            "nav-meuschamados", "nav-perfil", 
        ]
    },

    "Assistente Financeiro": {
        home: "/templates/home_usuario.html",
        allowedNavs: [
            "nav-home", "nav-chamado",
            "nav-meuschamados", "nav-perfil", "nav-atender"
        ]
    },


    "Analista de RH": {
        home: "/templates/home_usuario.html",
        allowedNavs: [
            "nav-home", "nav-chamado",
            "nav-meuschamados", "nav-perfil", "nav-atender"
        ]
    }
};

/* ==========================================================
    GERENCIADOR DE UI
   ========================================================== */

const UI = {
    updateInterface(user) {
        const role = user.cargo?.trim() || null;
        const userName = user.nome || "Usuário";

        console.log(`PERMISSÕES → Aplicando interface para cargo: ${role}`);

        // Atualiza o nome no topo
        const usernameEl = document.getElementById("navbar-username");
        if (usernameEl) usernameEl.textContent = userName;

        // Captura todos os itens do menu
        const allNavElements = Array.from(document.querySelectorAll("[id^='nav-']"));

        // Esconde tudo
        allNavElements.forEach(nav => nav.style.display = "none");

        // Valida role
        const roleInfo = ROLE_CONFIG[role];
        if (!roleInfo) {
            console.warn(`Cargo '${role}' não encontrado na configuração de permissões.`);
            return;
        }

        // Exibe apenas itens permitidos
        roleInfo.allowedNavs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = "block";
        });
    },

safeRedirect(user) {
    const role = user.cargo?.trim();
    if (!role) return;

    const roleInfo = ROLE_CONFIG[role];
    if (!roleInfo) return;

    const currentPage = window.location.pathname;

    // Permitir navegação normal entre páginas
    const allowedPages = [
        "/templates/chamado.html",
        "/templates/verChamado.html",
        "/templates/triagem.html",
        "/templates/ger_usuarios.html",
        "/templates/meus_chamados.html",
        "/templates/perfil.html",
        "/templates/atender_chamado.html",

        roleInfo.home
    ];

    // Só redireciona se a página atual NÃO estiver na lista
    if (!allowedPages.some(page => currentPage.endsWith(page.split("/").pop()))) {
        window.location.href = roleInfo.home;
    }
},
};

/* ==========================================================
    NAVBAR LOADER
   ========================================================== */

function enableDropdowns() {
    if (window.bootstrap) {
        document.querySelectorAll(".dropdown-toggle").forEach(el => {
            new bootstrap.Dropdown(el);
        });
    } else {
        setTimeout(enableDropdowns, 100);
    }
}

function loadNavbar() {
    return new Promise((resolve) => {
        const placeholder = document.getElementById("navbar-placeholder");
        if (!placeholder) return resolve();

        fetch("/templates/navbar.html")
            .then(r => r.text())
            .then(html => {
                placeholder.innerHTML = html;

                /* Ativar dropdown Bootstrap depois de inserir HTML
                document.querySelectorAll('.dropdown-toggle').forEach(el => {
                    new bootstrap.Dropdown(el);
                });*/
                enableDropdowns();

                // Carregar script extra da navbar só 1 vez
                if (!document.querySelector("script[data-script='navbar']")) {
                    const script = document.createElement("script");
                    script.src = "/static/js/navbar.js";
                    script.dataset.script = "navbar";
                    document.body.appendChild(script);
                }

                resolve();
            })
            .catch(err => {
                console.error("Erro ao carregar navbar:", err);
                placeholder.innerHTML = "<p>Erro ao carregar menu</p>";
                resolve();
            });
    });
}




/* ==========================================================
    FETCH COM TOKEN
   ========================================================== */

async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem("authToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(new URL(endpoint, window.location.origin), {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("usuario");
        window.location.href = "/templates/login.html";
        throw new Error("Não autorizado");
    }

    return response;
}
