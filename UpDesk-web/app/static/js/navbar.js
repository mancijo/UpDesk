/* c:\UpDesk\UpDesk-web\app\static\js\navbar.js */

document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (navbarToggler && navbarMenu) {
        navbarToggler.addEventListener('click', function() {
            navbarMenu.classList.toggle('show');
            const expanded = navbarToggler.getAttribute('aria-expanded') === 'true' || false;
            navbarToggler.setAttribute('aria-expanded', !expanded);
        });
    }

    const userDropdownButton = document.getElementById('userDropdownButton');
    const userDropdownContent = document.querySelector('.navbar-user-dropdown-content');

    if (userDropdownButton && userDropdownContent) {
        userDropdownButton.addEventListener('click', function() {
            userDropdownContent.classList.toggle('show');
        });

        // Fechar o dropdown se clicar fora dele
        document.addEventListener('click', function(event) {
            if (!userDropdownButton.contains(event.target) && !userDropdownContent.contains(event.target)) {
                userDropdownContent.classList.remove('show');
            }
        });
    }
});