const openCreateUserModal = (e) => {
    e.preventDefault();
  // Limpa todos os campos do formulário explicitamente para evitar qualquer autofill
  const form = document.getElementById('formCriarUsuario');
  if (form) {
    form.reset();
    const fieldsToClear = ['nome','email','telefone','setor','cargo','senha','confirma_senha'];
    fieldsToClear.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
      }
    });
    // Limpa erros anteriores
    fieldsToClear.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('is-invalid');
      const err = document.getElementById('error-' + id);
      if (err) err.textContent = '';
    });
    const general = document.getElementById('createFormErrors');
    if (general) { general.classList.add('d-none'); general.textContent = ''; }
  }
  // Ensure password inputs are readonly to discourage browser password managers
  const senha = document.getElementById('senha');
  const confirma = document.getElementById('confirma_senha');
  if (senha) senha.setAttribute('readonly', 'readonly');
  if (confirma) confirma.setAttribute('readonly', 'readonly');
  // Add one-time focus listeners that remove readonly so user can type and prevent autofill
  [senha, confirma].forEach(el => {
    if (!el) return;
    const onFocus = function() {
      el.removeAttribute('readonly');
      el.removeEventListener('focus', onFocus);
    };
    el.addEventListener('focus', onFocus);
  });
  // Abre o modal após limpeza
  var modal = new bootstrap.Modal(document.getElementById('modalCriarUsuario'));
  modal.show();
  // Ajusta cargo de acordo com setor após reset
  const setorEl = document.getElementById('setor');
  const cargoEl = document.getElementById('cargo');
  if (cargoEl) updateCargoOptionsForSelect(setorEl ? setorEl.value : '', cargoEl, null);
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
  document.getElementById("edit-telefone").value = formatBRPhone(telefone);
    document.getElementById("edit-setor").value = setor;
  // atualiza opções de cargo dependendo do setor
  const editCargoSel = document.getElementById('edit-cargo');
  updateCargoOptionsForSelect(setor, editCargoSel, cargo);

    // senha sempre em branco
    document.getElementById("edit-senha").value = "";
    // tornar readonly para evitar preenchimento automático
    const editSenha = document.getElementById('edit-senha');
    if (editSenha) {
      editSenha.setAttribute('readonly','readonly');
      const onFocusEdit = function() { editSenha.removeAttribute('readonly'); editSenha.removeEventListener('focus', onFocusEdit); };
      editSenha.addEventListener('focus', onFocusEdit);
    }

  // Ajusta action para a rota correta dentro do blueprint 'usuarios'
  document.getElementById("formEditarUsuario").action = `/usuarios/editar/${IDtoEdit}`;

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
  // Tenta obter token CSRF a partir de um campo oculto em qualquer formulário presente na página
  let csrfToken = null;
  const csrfInput = document.querySelector('input[name="csrf_token"]');
  if (csrfInput) csrfToken = csrfInput.value;

  // Se não encontrar token, tentamos enviar um POST simples (será rejeitado pelo CSRF)
  const headers = {};
  let body = undefined;
  if (csrfToken) {
  // Flask-WTF aceita o header 'X-CSRFToken' ou o campo form 'csrf_token'
  headers['X-CSRFToken'] = csrfToken;
  // Também enviamos um body vazio com o token como fallback para servidores que leem form data
  const fd = new FormData();
  fd.append('csrf_token', csrfToken);
  body = fd;
  }

  // Chama a rota correta de exclusão no blueprint 'usuarios'
  const response = await fetch(`/usuarios/excluir/${id}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers,
            body: body
        });
    if (response.ok) {
      modal.hide();
      window.location.reload();
    } else {
      alert('Erro ao excluir usuário!');
    }
  });
}

async function reativarUsuario(id) {
  // tenta obter token CSRF a partir de um campo oculto em qualquer formulário presente na página
  let csrfToken = null;
  const csrfInput = document.querySelector('input[name="csrf_token"]');
  if (csrfInput) csrfToken = csrfInput.value;

  const headers = {};
  let body = undefined;
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
    const fd = new FormData(); fd.append('csrf_token', csrfToken);
    body = fd;
  }

  const resp = await fetch(`/usuarios/ativar/${id}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers,
    body: body
  });
  if (resp.ok) {
    // recarrega a página para refletir mudança
    window.location.reload();
  } else {
    alert('Erro ao reativar usuário');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // inicializa máscara de telefone
  setupPhoneMask();
  // inicializa comportamento do cargo baseado no setor
  setupCargoBehavior();
  const formEditarUsuario = document.getElementById('formEditarUsuario');
  if (formEditarUsuario) {
    formEditarUsuario.addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const usuarioId = form.getAttribute('action').split('/').pop();

      const response = await fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        body: data
      });

      if (response.ok) {
        // Fecha o modal de edição
        var modalEditar = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
        if (modalEditar) modalEditar.hide();

        // Recarrega a página para atualizar a lista
        window.location.reload();
      } else {
        alert('Erro ao editar usuário!');
      }
    });
  }

  // Botão de criar usuário
  const formCriarUsuario = document.getElementById('formCriarUsuario');
  if (formCriarUsuario) {
    formCriarUsuario.addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        body: data
      });

      if (response.ok) {
        var modalCriar = bootstrap.Modal.getInstance(document.getElementById('modalCriarUsuario'));
        if (modalCriar) modalCriar.hide();

        var modalSucesso = new bootstrap.Modal(document.getElementById('modalSucesso'));
        modalSucesso.show();

        document.getElementById('modalSucesso').addEventListener('hidden.bs.modal', function () {
          window.location.reload();
        }, { once: true });
      } else {
        // Limpa marcações anteriores
        const fields = ['nome','email','telefone','setor','cargo','senha','confirma_senha'];
        fields.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('is-invalid');
          const err = document.getElementById('error-' + id);
          if (err) err.textContent = '';
        });

        const errorData = await response.json();
        if (errorData.erros) {
          // mostra erros por campo
          for (const field in errorData.erros) {
            const input = document.getElementById(field);
            const err = document.getElementById('error-' + field);
            const message = Array.isArray(errorData.erros[field]) ? errorData.erros[field][0] : errorData.erros[field];
            if (input) input.classList.add('is-invalid');
            if (err) err.textContent = message;
          }
          // se houver mensagens que não batem com campos, mostramos no topo
          const general = document.getElementById('createFormErrors');
          if (general && errorData.mensagem) {
            general.textContent = errorData.mensagem;
            general.classList.remove('d-none');
          }
        } else {
          // fallback genérico
          const general = document.getElementById('createFormErrors');
          if (general) {
            general.textContent = 'Erro ao criar usuário. Verifique os dados e tente novamente.';
            general.classList.remove('d-none');
          } else {
            alert('Erro ao criar usuário.');
          }
        }
      }
    });
  }
}); // fim DOMContentLoaded

// --- Sugestão automática de domínio para e-mail @updesk.com.br ---
// Lógica: quando o usuário digita '@' (ou há um '@' sem domínio), mostramos uma sugestão
// e ao pressionar Tab ou clicar na sugestão completamos com '@updesk.com.br'.
function setupEmailDomainSuggestion() {
  const emailInput = document.getElementById('email');
  const suggestion = document.getElementById('emailSuggestion');
  if (!emailInput || !suggestion) return;

  const domain = '@updesk.com.br';

  function showSuggestion() {
    const val = emailInput.value || '';
    const atIndex = val.indexOf('@');
    if (atIndex === -1) {
      suggestion.style.display = 'none';
      suggestion.setAttribute('aria-hidden', 'true');
      return;
    }
    // já tem domínio completo -> não sugerir
    if (val.toLowerCase().endsWith(domain)) {
      suggestion.style.display = 'none';
      suggestion.setAttribute('aria-hidden', 'true');
      return;
    }
    // mostra sugestão
    suggestion.style.display = 'block';
    suggestion.setAttribute('aria-hidden', 'false');
  }

  function completeDomain() {
    const val = emailInput.value || '';
    const parts = val.split('@');
    const prefix = parts[0] || '';
    emailInput.value = prefix + domain;
    // move cursor para o fim
    try { emailInput.setSelectionRange(emailInput.value.length, emailInput.value.length); } catch (e) {}
    suggestion.style.display = 'none';
    suggestion.setAttribute('aria-hidden', 'true');
  }

  // Input event - decide quando mostrar
  emailInput.addEventListener('input', function (e) {
    showSuggestion();
  });

  // Keydown - intercepta Tab para completar
  emailInput.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      // se a sugestão estiver visível, completa e previne o comportamento padrão
      if (suggestion.style.display === 'block') {
        e.preventDefault();
        completeDomain();
        // tenta focar próximo controle do formulário
        const form = emailInput.form;
        if (form) {
          const elements = Array.from(form.querySelectorAll('input, select, textarea, button'));
          const idx = elements.indexOf(emailInput);
          if (idx >= 0 && idx + 1 < elements.length) elements[idx + 1].focus();
        }
      }
    } else if (e.key === 'Escape') {
      suggestion.style.display = 'none';
      suggestion.setAttribute('aria-hidden', 'true');
    }
  });

  // Clique na sugestão também completa
  suggestion.addEventListener('click', function () {
    completeDomain();
    emailInput.focus();
  });

  // Ao perder o foco, escondemos a sugestão após pequeno timeout (para permitir clique)
  emailInput.addEventListener('blur', function () {
    setTimeout(() => {
      suggestion.style.display = 'none';
      suggestion.setAttribute('aria-hidden', 'true');
    }, 150);
  });
}

// Inicializa a sugestão assim que o script for carregado (caso o DOM já esteja pronto, o listener anterior cuida)
document.addEventListener('DOMContentLoaded', function () { setupEmailDomainSuggestion(); });

// --- Máscara para telefone (BR) ---
function formatBRPhone(value) {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  // DDD + 8 ou 9 dígitos
  if (digits.length <= 2) return '(' + digits;
  if (digits.length <= 6) {
    return '(' + digits.slice(0,2) + ') ' + digits.slice(2);
  }
  if (digits.length <= 10) {
    // (##) ####-####
    return '(' + digits.slice(0,2) + ') ' + digits.slice(2,6) + (digits.length > 6 ? '-' + digits.slice(6) : '');
  }
  // 11+ digits -> (##) #####-####
  return '(' + digits.slice(0,2) + ') ' + digits.slice(2,7) + '-' + digits.slice(7,11);
}

function setupPhoneMask() {
  const inputs = [document.getElementById('telefone'), document.getElementById('edit-telefone')].filter(Boolean);
  if (!inputs.length) return;

  inputs.forEach(input => {
    // aplica máscara ao digitar
    input.addEventListener('input', function (e) {
      const start = this.selectionStart;
      const old = this.value;
      const formatted = formatBRPhone(old);
      this.value = formatted;
      // tenta restaurar posição do cursor (simples)
      try { this.setSelectionRange(this.value.length, this.value.length); } catch (err) {}
    });

    // ao perder o foco, garante formatação final
    input.addEventListener('blur', function () {
      this.value = formatBRPhone(this.value);
    });
  });
}

// --- Comportamento dinâmico do campo 'cargo' dependendo do setor ---
function updateCargoOptionsForSelect(setorValue, cargoSelect, preferredValue) {
  if (!cargoSelect) return;
  const tech = 'Tecnologia e Inovação';
  // Clear existing options
  cargoSelect.innerHTML = '';
  if (setorValue === tech) {
    const opts = [
      {v: 'Supervisor', t: 'Supervisor'},
      {v: 'N1', t: 'N1'},
      {v: 'N2', t: 'N2'}
    ];
    opts.forEach(o => {
      const el = document.createElement('option'); el.value = o.v; el.textContent = o.t; cargoSelect.appendChild(el);
    });
    cargoSelect.disabled = false;
    // try to select preferredValue or default to N1
    if (preferredValue && Array.from(cargoSelect.options).some(o=>o.value===preferredValue)) cargoSelect.value = preferredValue;
    else cargoSelect.value = 'N1';
  } else {
    const el = document.createElement('option'); el.value = 'Usuário'; el.textContent = 'Usuário'; cargoSelect.appendChild(el);
    cargoSelect.value = 'Usuário';
    cargoSelect.disabled = true;
    // When a select is disabled it won't be submitted. Create a hidden input with the same
    // name to ensure the value is posted to the server.
    const hiddenId = (cargoSelect.id || 'cargo') + '_hidden';
    let hidden = document.getElementById(hiddenId);
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id = hiddenId;
      hidden.name = cargoSelect.name || cargoSelect.id || 'cargo';
      cargoSelect.parentNode.appendChild(hidden);
    }
    hidden.value = 'Usuário';
  }
  // If enabled, remove any hidden fallback
  if (!cargoSelect.disabled) {
    const hiddenId = (cargoSelect.id || 'cargo') + '_hidden';
    const existing = document.getElementById(hiddenId);
    if (existing) existing.remove();
  }
}

function setupCargoBehavior() {
  const setor = document.getElementById('setor');
  const editSetor = document.getElementById('edit-setor');
  const cargo = document.getElementById('cargo');
  const editCargo = document.getElementById('edit-cargo');

  if (setor && cargo) {
    // initialize
    updateCargoOptionsForSelect(setor.value, cargo, cargo.value);
    setor.addEventListener('change', function() { updateCargoOptionsForSelect(this.value, cargo, null); });
  }

  if (editSetor && editCargo) {
    updateCargoOptionsForSelect(editSetor.value, editCargo, editCargo.value);
    editSetor.addEventListener('change', function() { updateCargoOptionsForSelect(this.value, editCargo, null); });
  }
}
