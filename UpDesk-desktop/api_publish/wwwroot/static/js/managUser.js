// /static/js/managUser.js

let editUserModal, createUserModal, deleteUserModal;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa as instâncias dos modais do Bootstrap
    editUserModal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    createUserModal = new bootstrap.Modal(document.getElementById('modalCriarUsuario'));
    deleteUserModal = new bootstrap.Modal(document.getElementById('modalExcluirUsuario'));

    // Carrega a lista de usuários inicial
    fetchAndDisplayUsers();

    // --- EVENT LISTENERS ---

    // Busca
    document.getElementById('search-button').addEventListener('click', () => fetchAndDisplayUsers());
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchAndDisplayUsers();
    });

    // Submissão do formulário de criação
    document.getElementById('formCriarUsuario').addEventListener('submit', handleCreateUser);

    // Submissão do formulário de edição
    document.getElementById('formEditarUsuario').addEventListener('submit', handleEditUser);

    // Delegação de eventos para os botões na tabela
    const tableBody = document.getElementById('usuarios-table-body');
    tableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-user-btn')) {
            prepareEditModal(event.target);
        }
        if (event.target.classList.contains('delete-user-btn')) {
            prepareDeleteModal(event.target);
        }
    });
});

/**
 * Busca usuários na API e popula a tabela.
 */
async function fetchAndDisplayUsers() {
    const query = document.getElementById('search-input').value;
    const tableBody = document.getElementById('usuarios-table-body');
    
    // ATENÇÃO: Crie o endpoint GET /api/usuarios no seu backend.
    // Ele deve aceitar um parâmetro 'q' para busca por nome/email.
    let endpoint = '/api/usuarios';
    if (query) {
        endpoint += `?q=${encodeURIComponent(query)}`;
    }

    try {
        const response = await fetchWithAuth(endpoint);
        if (!response.ok) throw new Error('Falha ao carregar usuários');
        const users = await response.json();

        tableBody.innerHTML = '';
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.cargo || 'N/A'}</td>
                <td>
                    <button class="btn btn-primary btn-sm edit-user-btn"
                        data-id='${user.id}'
                        data-nome='${user.nome}'
                        data-email='${user.email}'
                        data-telefone='${user.telefone || ""}'
                        data-setor='${user.setor || ""}'
                        data-cargo='${user.cargo || ""}'>Editar</button>
                    <button class="btn btn-danger btn-sm delete-user-btn" 
                        data-id='${user.id}' 
                        data-nome='${user.nome}'>Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">${error.message}</td></tr>';
    }
}

/**
 * Prepara e abre o modal de edição com os dados do usuário.
 * @param {HTMLElement} button O botão de editar que foi clicado.
 */
function prepareEditModal(button) {
    document.getElementById('edit-id').value = button.dataset.id;
    document.getElementById('edit-nome').value = button.dataset.nome;
    document.getElementById('edit-email').value = button.dataset.email;
    document.getElementById('edit-telefone').value = button.dataset.telefone;
    document.getElementById('edit-setor').value = button.dataset.setor;
    document.getElementById('edit-cargo').value = button.dataset.cargo;
    document.getElementById('edit-senha').value = ''; // Limpa o campo de senha
    editUserModal.show();
}

/**
 * Prepara e abre o modal de exclusão.
 * @param {HTMLElement} button O botão de excluir que foi clicado.
 */
function prepareDeleteModal(button) {
    const id = button.dataset.id;
    const nome = button.dataset.nome;
    
    document.getElementById('delete-user-name').textContent = nome;
    
    const btnConfirmar = document.getElementById('btnConfirmarExcluir');
    // Passa o ID para o botão de confirmação, clonando para evitar múltiplos listeners
    const newBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(newBtn, btnConfirmar);
    
    newBtn.addEventListener('click', () => handleDeleteUser(id));
    
    deleteUserModal.show();
}

/**
 * Manipula o envio do formulário de criação de usuário.
 */
async function handleCreateUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetchWithAuth('/api/usuarios', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            // Primeiro, tenta ler o corpo da resposta como JSON
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                // Se o corpo não for JSON, usa o texto de status
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            console.error('API Error:', errorData);
            // Lança um erro mais descritivo
            throw new Error(errorData.mensagem || `Erro ao criar usuário: ${response.statusText}`);
        }
        
        createUserModal.hide();
        form.reset();
        await fetchAndDisplayUsers(); // Atualiza a tabela
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

/**
 * Manipula o envio do formulário de edição de usuário.
 */
async function handleEditUser(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = data.id;

    // Remove a senha do objeto se estiver vazia, para não alterar sem querer
    if (!data.senha) {
        delete data.senha;
    }

    try {
        // ATENÇÃO: Crie o endpoint PUT /api/usuarios/{id} no seu backend.
        const response = await fetchWithAuth(`/api/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Erro ao editar usuário');

        editUserModal.hide();
        await fetchAndDisplayUsers(); // Atualiza a tabela
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

/**
 * Manipula a exclusão de um usuário.
 * @param {string} id O ID do usuário a ser excluído.
 */
async function handleDeleteUser(id) {
    try {
        // ATENÇÃO: Crie o endpoint DELETE /api/usuarios/{id} no seu backend.
        const response = await fetchWithAuth(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir usuário');

        deleteUserModal.hide();
        await fetchAndDisplayUsers(); // Atualiza a tabela
    } catch (error) { 
        console.error(error);
        alert(error.message);
    }
}