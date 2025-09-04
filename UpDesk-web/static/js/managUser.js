const openCreateUserModal = (e) => {
    e.preventDefault();
    var modal = new bootstrap.Modal(document.getElementById('modalCriarUsuario'));
    modal.show();
}

const openEditUserModal = (button) => {
    const IDtoEdit = button.getAttribute("data-id");
    const nome = button.getAttribute("data-nome") || "";
    const email = button.getAttribute("data-email") || "";
    const telefone = button.getAttribute("data-telefone") || "";
    const setor = button.getAttribute("data-setor") || "";
    const cargo = button.getAttribute("data-cargo") || "";

    // Preenche os campos do modal de edição
    document.getElementById("edit-nome").value = nome;
    document.getElementById("edit-email").value = email;
    document.getElementById("edit-telefone").value = telefone;
    document.getElementById("edit-setor").value = setor;
    document.getElementById("edit-cargo").value = cargo;

    // senha sempre em branco
    document.getElementById("edit-senha").value = "";

    document.getElementById("formEditarUsuario").action = `/editar_usuario/${IDtoEdit}`;

    var modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
};


function abrirModalExcluir(id, nome, email) {
    document.getElementById('modalUsuarioId').textContent = id;
    document.getElementById('modalUsuarioNome').textContent = nome;
    document.getElementById('modalUsuarioEmail').textContent = email;
    var modal = new bootstrap.Modal(document.getElementById('modalExcluirUsuario'));
    modal.show();

    // Remove event listener anterior para evitar múltiplos binds
    const btn = document.getElementById('btnConfirmarExcluir');
    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);

    novoBtn.addEventListener('click', async function () {
        const response = await fetch(`/excluir_usuario/${id}`, {
            method: 'POST'
        });
        if (response.ok) {
            modal.hide();
            window.location.reload();
        } else {
            alert('Erro ao excluir usuário!');
        }
    });
}

document.getElementById('formCriarUsuario').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    const response = await fetch(form.action, {
        method: 'POST',
        body: data
    });

    if (response.ok) {
        // Fecha o modal de criar usuário, se estiver usando
        var modalCriar = bootstrap.Modal.getInstance(document.getElementById('modalCriarUsuario'));
        if (modalCriar) modalCriar.hide();

        // Mostra o modal de sucesso
        var modalSucesso = new bootstrap.Modal(document.getElementById('modalSucesso'));
        modalSucesso.show();

        // Opcional: recarrega a lista de usuários após fechar o modal de sucesso
        document.getElementById('modalSucesso').addEventListener('hidden.bs.modal', function () {
            window.location.reload();
        }, { once: true });
    } else {
        alert('Erro ao criar usuário!');
    }
});


document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('#searchUser input[name="q"]');
  const tableRows = document.querySelectorAll('table tbody tr');

  searchInput.addEventListener('input', function() {
    const query = searchInput.value.toLowerCase();

    tableRows.forEach(row => {
      // Se for a linha "Nenhum usuario encontrado", sempre mostra
      if (row.querySelector('td[colspan]')) {
        row.style.display = '';
        return;
      }
      const cells = row.querySelectorAll('td');
      let found = false;
      cells.forEach(cell => {
        if (cell.textContent.toLowerCase().includes(query)) {
          found = true;
        }
      });
      row.style.display = found ? '' : 'none';
    });
  });
});