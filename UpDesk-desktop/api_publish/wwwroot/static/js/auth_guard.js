// /static/js/auth_guard.js

(function() {
    // A fonte da verdade para autenticação é o token.
    const token = localStorage.getItem('authToken');

    // Verifica se a página atual é a de login para evitar loops de redirecionamento.
    const isLoginPage = window.location.pathname.includes('login.html');

    // Se não houver token E a página atual NÃO for a de login, o usuário não está
    // autenticado e deve ser redirecionado.
    if (!token && !isLoginPage) {
        console.log('Auth Guard: Token não encontrado, redirecionando para o login.');
        window.location.href = '/templates/login.html'; 
    }
})();
