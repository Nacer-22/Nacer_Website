(() => {
  "use strict";
  const config = window.HAX_SITE_CONFIG || { links: {} };
  const menu = document.getElementById("mainNav");
  const toggle = document.getElementById("menuToggle");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }));
  }

  document.querySelectorAll("[data-link-key]").forEach(link => {
    const url = config.links?.[link.dataset.linkKey];
    if (typeof url === "string" && /^https:\/\//i.test(url.trim())) {
      link.href = url.trim();
      link.removeAttribute("aria-disabled");
      link.innerHTML = 'فتح المشروع <span>↗</span>';
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });

  const contact = document.getElementById("contactLink");
  const telegram = config.links?.telegram;
  if (contact && typeof telegram === "string" && /^https:\/\//i.test(telegram.trim())) {
    contact.href = telegram.trim();
    contact.target = "_blank";
    contact.rel = "noopener noreferrer";
    contact.classList.remove("disabled-link");
    contact.removeAttribute("aria-disabled");
    contact.innerHTML = 'تواصل الآن <span>↗</span>';
  }
})();
