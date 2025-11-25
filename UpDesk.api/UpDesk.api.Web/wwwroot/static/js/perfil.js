// /static/js/perfil.js

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

function loadUserProfile() {
    // Pega os dados do usuário que foram armazenados no localStorage durante o login.
    const user = JSON.parse(localStorage.getItem('usuario'));

    if (user) {
        // Preenche os elementos da página com as informações do usuário.
        document.getElementById('profile-name').textContent = user.nome || 'Não informado';
        document.getElementById('profile-email').textContent = user.email || 'Não informado';
        document.getElementById('profile-cargo').textContent = user.cargo || 'Não informado';
        document.getElementById('profile-setor').textContent = user.setor || 'Não informado';
        document.getElementById('profile-telefone').textContent = user.telefone || 'Não informado';
    } else {
        // Se, por algum motivo, os dados do usuário não estiverem no localStorage,
        // o auth_guard.js já deve ter redirecionado para a página de login.
        // Isto é apenas uma segurança adicional.
        console.error('Dados do usuário não encontrados no localStorage.');
        document.getElementById('profile-name').textContent = 'Erro ao carregar dados';
    }
}
