// Utility helpers
function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function load(key, fallback = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
}

function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
}