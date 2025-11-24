// JS para página chamado_enviado
// Funcionalidades:
// - foco no botão primário
// - mantem fluxo manual (sem auto-redirect)

document.addEventListener('DOMContentLoaded', function () {
  // foco no CTA primário se existir
  const btnVer = document.getElementById('btn-ver-chamados');
  if (btnVer) {
    try { btnVer.focus(); } catch (e) { /* ignore */ }
  }

  // No additional interactions required; page remains manual
});
