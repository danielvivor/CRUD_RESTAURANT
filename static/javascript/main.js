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

// RESERVATIONS (Temporary Local Storage - Will migrate to Django next!)
let reservations = load("reservations");

const multiResForm = document.getElementById("multi-reservation-form");
const addTableBtn = document.getElementById("add-table-btn");
const tablesContainer = document.getElementById("tables-container");
const tableTemplate = document.getElementById("table-row-template");
const successMsg = document.getElementById("booking-success-msg");

if (addTableBtn && tablesContainer && tableTemplate) {
    addTableBtn.addEventListener("click", () => {
        const clone = tableTemplate.content.cloneNode(true);
        tablesContainer.appendChild(clone);
        updateTableNumbers();
    });
}

if (tablesContainer) {
    tablesContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-table")) {
            e.target.closest(".table-entry-card").remove();
            updateTableNumbers();
        }
    });
}

function updateTableNumbers() {
    const tableCards = tablesContainer.querySelectorAll(".table-item");
    tableCards.forEach((card, index) => {
        const numberSpan = card.querySelector(".table-number");
        if (numberSpan) {
            numberSpan.textContent = `Table #${index + 1}`;
        }
    });
}