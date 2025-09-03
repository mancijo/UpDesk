// Toggle dropdown do usuário
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

userBtn.addEventListener('click', () => {
  const isExpanded = userBtn.getAttribute('aria-expanded') === 'true';
  userDropdown.style.display = isExpanded ? 'none' : 'flex';
  userBtn.setAttribute('aria-expanded', !isExpanded);
});

// Fechar dropdown clicando fora
document.addEventListener('click', (e) => {
  if (userBtn && userDropdown && !userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.style.display = 'none';
    userBtn.setAttribute('aria-expanded', false);
  }
});

// Toggle do menu hamburger
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});
