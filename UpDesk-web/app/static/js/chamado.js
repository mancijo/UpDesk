document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('anexo');
    const fileNameSpan = document.querySelector('.chamado-form__file-name');
    const browseButton = document.querySelector('.chamado-form__btn--browse');
    const form = document.querySelector('.chamado-form');

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

    // Registro leve do submit (não altera o comportamento padrão)
    if (form) {
        form.addEventListener('submit', function () {
            console.debug('chamado form submit');
        });
    }
});