document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form[action*="buscar_solucao_ia"]');

    if (form) {
        form.addEventListener('submit', function(event) {
            if (!confirm('Deseja buscar uma solução com a IA antes de abrir o chamado?')) {
                event.preventDefault(); // Impede o envio do formulário se o usuário cancelar
            }
        });
    }
});