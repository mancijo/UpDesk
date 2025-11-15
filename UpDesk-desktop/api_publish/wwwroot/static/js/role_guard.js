(function() {
    console.log('ROLE GUARD: Iniciando verificação de permissões...');

    // Recupera os dados do usuário armazenados no localStorage com segurança
    let userData = null;
    try {
        userData = JSON.parse(localStorage.getItem('usuario'));
    } catch (err) {
        console.error('ROLE GUARD: Erro ao ler dados do usuário no localStorage:', err);
    }

    const userRole = userData && userData.cargo ? userData.cargo.trim() : null;
    const userName = userData && userData.nome ? userData.nome : 'Usuário desconhecido';

    if (!userRole) {
        console.error('ROLE GUARD: Nenhum cargo encontrado no localStorage.');
        return;
    }

    // Corrige o path para funcionar tanto em servidor quanto em Electron (file://)
    const fullPath = window.location.href;
    const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

    console.log(`ROLE GUARD: Usuário '${userName}' (${userRole}) acessando '${fileName}'`);

    // =========================
    // 🔒 DEFINIÇÃO DE PERMISSÕES
    // =========================

    const supervisorPages = ['ger_usuarios.html'];
    const techPages = ['triagem.html', 'atender_chamado.html'];
    const auxPages = ['chamado.html', 'meus_chamados.html']; // apenas essas

    // Cargos permitidos para áreas técnicas
    const allowedRoles = {
        'Supervisor': [...supervisorPages, ...techPages, ...auxPages],
        'Técnico N1': [...techPages, ...auxPages],
        'Técnico N2': [...techPages, ...auxPages],
        'Triagem': ['triagem.html', ...auxPages],
        'Aux. administrativo': auxPages // restrito
    };

    // Caso o cargo não exista no mapa
    if (!allowedRoles[userRole]) {
        console.warn(`ROLE GUARD: Cargo '${userRole}' não reconhecido, acesso bloqueado.`);
        window.location.href = 'acesso-negado.html';
        return;
    }

    // =========================
    // 🔍 VERIFICAÇÃO DE ACESSO
    // =========================
    const isAllowed = allowedRoles[userRole].some(page => fileName === page);

    if (!isAllowed) {
        console.warn(`ROLE GUARD: Acesso negado! Cargo '${userRole}' tentando acessar '${fileName}'`);
        window.location.href = 'acesso-negado.html';
        return;
    }

    console.log(`ROLE GUARD: Acesso permitido para '${userRole}' em '${fileName}' ✅`);
})();
