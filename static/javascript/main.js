// Utility helpers (Retained for reservation management until migrated)
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

// Mobile Navigation
const navToggle = document.querySelector(".nav-toggle");
const navContainer = document.querySelector(".nav-container");

if (navToggle && navContainer) {
    navToggle.addEventListener("click", () => {
        navContainer.classList.toggle("nav-open");
        const isOpen = navContainer.classList.contains("nav-open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });
}

// Infinite Auto-Scrolling for Menu
document.querySelectorAll(".menu-scroll-track").forEach(track => {
    const images = Array.from(track.children);
    images.forEach(img => {
        const clone = img.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
    });
});