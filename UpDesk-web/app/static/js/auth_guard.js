// Local do arquivo: static/js/auth-guard.js

(function() {
    // Tenta pegar os dados do usuário do localStorage
    const usuarioString = localStorage.getItem('usuario');

    // Se não encontrar dados do usuário, significa que ele não está logado.
    if (!usuarioString) {
        // Redireciona imediatamente para a página de login.
        // Usamos '/' que é a rota do seu login.html.
        window.location.href = '/'; 
    }
})();