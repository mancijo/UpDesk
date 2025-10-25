document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('anexo');
    const fileNameSpan = document.querySelector('.chamado-form__file-name');
    const browseButton = document.querySelector('.chamado-form__btn--browse');
    const form = document.querySelector('.chamado-form');
    const btnBuscarIa = document.getElementById('btn-buscar-ia');
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const confirmIaSearchBtn = document.getElementById('confirm-ia-search');
    const loadingModal = document.getElementById('loadingModal');

    // Lógica para o input de arquivo customizado
    if (fileInput && fileNameSpan && browseButton) {
        browseButton.addEventListener('click', function() {
            fileInput.click(); // Simula o clique no input de arquivo real
        });

        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
            } else {
                fileNameSpan.textContent = 'Nenhum arquivo selecionado';
            }
        });
    }

    // 1. Lida com o clique no botão "Buscar solução com a IA"
    if (btnBuscarIa) {
        btnBuscarIa.addEventListener('click', function() {
            // Valida o formulário antes de abrir o modal de confirmação
            if (form.checkValidity()) {
                confirmationModal.show();
            } else {
                // Se o formulário for inválido, força a exibição das mensagens de validação do navegador
                form.reportValidity();
            }
        });
    }

    // 2. Lida com o clique no botão "Confirmar" dentro do modal
    if (confirmIaSearchBtn) {
        confirmIaSearchBtn.addEventListener('click', function() {
            // Esconde o modal de confirmação
            confirmationModal.hide();
            
            // Mostra o modal de carregamento
            if (loadingModal) {
                loadingModal.classList.add('loading-modal--show');
            }
            
            // Envia o formulário
            form.submit();
        });
    }
});