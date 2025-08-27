const openCreateUserModal = (e) => {
    e.preventDefault();
    var modal = new bootstrap.Modal(document.getElementById('modalCriarUsuario'));
    modal.show();
}

const openEditUserModal = (e) => {
    e.preventDefault();
    var modal = new bootstrap.Modal(document.getElementById('modalEditUser'));
    modal.show();
}

let usuarioIdParaExcluir = null;

function abrirModalExcluir(id, nome, email) {
    usuarioIdParaExcluir = id;
    document.getElementById('modalUsuarioId').textContent = id;
    document.getElementById('modalUsuarioNome').textContent = nome;
    document.getElementById('modalUsuarioEmail').textContent = email;
    var modal = new bootstrap.Modal(document.getElementById('modalExcluirUsuario'));
    modal.show();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btnConfirmarExcluir').onclick = function () {
        // Aqui você pode fazer a requisição para excluir o usuário
        // Exemplo usando fetch:
        fetch(`/excluir_usuario/${usuarioIdParaExcluir}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Erro ao excluir usuário.');
                }
            });
    };
});