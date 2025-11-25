// navbar.js
// Highlights the active navbar link using .active and aria-current="page".
// Behavior:
//  - If <body data-page="..."> is present, it will match nav links with data-page attribute.
//  - Otherwise it matches using the current location pathname against link hrefs.
// Accessibility: sets aria-current and ensures only one element has it.

(function () {
  'use strict';

  function normalizePath(p) {
    if (!p) return '/';
    // remove query and hash if present
    return p.split('?')[0].split('#')[0];
  }

  function setActiveByPage(page) {
    const links = document.querySelectorAll('.navbar .nav-link, .navbar .navbar-brand');
    let matched = false;
    links.forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (!linkPage) return;
      if (linkPage === page) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
        matched = true;
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
    return matched;
  }

  function setActiveByHref() {
    const current = normalizePath(window.location.pathname || window.location.href);
    const links = document.querySelectorAll('.navbar .nav-link, .navbar .navbar-brand');
    let matched = false;

    links.forEach(link => {
      // resolve href relative to origin
      try {
        const href = link.getAttribute('href');
        if (!href) return;
        const url = new URL(href, window.location.origin);
        const linkPath = normalizePath(url.pathname);
        // consider match if link path is equal or if link path is a prefix and points to index-equivalent
        if (linkPath === current || (linkPath.endsWith('/') && current.startsWith(linkPath))) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
          matched = true;
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      } catch (e) {
        // ignore malformed href
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    return matched;
  }

  function applyActiveState() {
    // prefer explicit body data-page override (useful for client-side rendering/templates)
    const body = document.body;
    const page = body ? body.getAttribute('data-page') : null;
    if (page) {
      const ok = setActiveByPage(page);
      if (ok) return;
    }

    // fallback to matching by href
    setActiveByHref();
  }

  // Run on DOMContentLoaded to ensure navbar exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyActiveState);
  } else {
    applyActiveState();
  }

})();
