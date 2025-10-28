/* c:\UpDesk\UpDesk-web\app\static\js\navbar.js */

document.addEventListener('DOMContentLoaded', function() {
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