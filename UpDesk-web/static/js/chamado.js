document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form-container form');
    const submitButton = form.querySelector('.btn-submit');

    submitButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Create modal elements
        const modal = document.createElement('div');
        modal.classList.add('modal');

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const closeButton = document.createElement('span');
        closeButton.classList.add('close-button');
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Buscar Solução com IA';

        const modalText = document.createElement('p');
        modalText.textContent = 'Deseja realmente buscar uma solução com IA para este chamado?';

        const modalButtons = document.createElement('div');
        modalButtons.classList.add('modal-buttons');

        const confirmButton = document.createElement('button');
        confirmButton.classList.add('btn-confirm');
        confirmButton.textContent = 'Confirmar';
        confirmButton.addEventListener('click', function() {
            modal.style.display = 'none';
            form.submit(); // Submit the form after confirmation
        });

        const cancelButton = document.createElement('button');
        cancelButton.classList.add('btn-cancel');
        cancelButton.textContent = 'Cancelar';
        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });

        modalButtons.appendChild(confirmButton);
        modalButtons.appendChild(cancelButton);

        modalContent.appendChild(closeButton);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalText);
        modalContent.appendChild(modalButtons);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        modal.style.display = 'block';

        window.addEventListener('click', function(event) {
            if (event.target == modal)
                modal.style.display = 'none';
        });
    });
});