const typekeysConfig = {
  releaseUrl: "https://github.com/Andrews3dfactory/TypeKey/releases/latest/download/TypeKeys-Setup.exe"
};

const setDownloadState = () => {
  const links = document.querySelectorAll("[data-download-link]");

  links.forEach((link) => {
    const placeholder = link.dataset.placeholder || "Coming Soon";

    if (typekeysConfig.releaseUrl) {
      link.href = typekeysConfig.releaseUrl;
      link.setAttribute("aria-disabled", "false");
      link.classList.remove("is-disabled");
      if (link.textContent.trim() === "Coming Soon") {
        link.textContent = "Download";
      }
      return;
    }

    link.href = "#download";
    link.setAttribute("aria-disabled", "true");
    link.classList.add("is-disabled");
    link.textContent = placeholder;
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });
  });
};

const initNav = () => {
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (!navToggle || !mainNav) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
};

const updateFooterYear = () => {
  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
};

setDownloadState();
initNav();
updateFooterYear();
