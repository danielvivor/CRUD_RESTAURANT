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

// Handle Reservation Submit via Django Backend API
if (multiResForm) {
    multiResForm.addEventListener("submit", e => {
        e.preventDefault();

        const bookingEmail = document.getElementById("booking-email").value.trim();
        const tableCards = tablesContainer.querySelectorAll(".table-item");

        // Collect dynamic form rows into a single clean data structure
        let bookingDetails = {
            email: bookingEmail,
            tables: []
        };

        tableCards.forEach(card => {
            const date = card.querySelector(".table-date").value;
            const time = card.querySelector(".table-time").value;
            const guests = card.querySelector(".table-guests").value;
            bookingDetails.tables.push({ date, time, guests });
        });

        // Fetch Django's CSRF security token value straight from the cookie layer
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // Post the booking data structure straight to new Django View
        fetch('/create-booking/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(bookingDetails)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reset UI on successful booking save
                multiResForm.reset();

                // Clear out additional dynamic rows, preserving only the baseline card
                while (tablesContainer.children.length > 1) {
                    tablesContainer.removeChild(tablesContainer.lastChild);
                }

                // Flash the visual feedback message container
                successMsg.style.display = "block";
                setTimeout(() => successMsg.style.display = "none", 4000);
            } else {
                alert("Booking error: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred while creating your reservation.");
        });
    });
}

const viewResForm = document.getElementById("view-reservation-form");
const resResultsContainer = document.getElementById("reservation-results");

// Search Reservations via Django Backend API
if (viewResForm) {
    viewResForm.addEventListener("submit", e => {
        e.preventDefault();
        const searchEmail = document.getElementById("search-email").value.trim();

        // Query our Django endpoint using a URL search parameter
        fetch(`/view-reservations/?email=${encodeURIComponent(searchEmail)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                if (data.reservations.length === 0) {
                    resResultsContainer.innerHTML = `<p style="color: #d9534f;">No bookings found for ${searchEmail}.</p>`;
                    return;
                }

                // Map database results directly into visual HTML cards
                let html = "";
                data.reservations.forEach(booking => {
                    html += `
                        <div class="result-card">
                            <div class="status-badge">Confirmed</div>
                            <p><strong>Booking ID:</strong> RES-${booking.id}</p>
                            <p><strong>Details:</strong> ${booking.date} at ${booking.time}</p>
                            <p><strong>Party Size:</strong> ${booking.guests} Guests</p>
                            <button class="btn-outline full-width target-cancel-btn" 
                                    style="margin-top: 1rem; padding: 0.5rem;" 
                                    data-id="${booking.id}">
                                Cancel Booking
                            </button>
                        </div>
                    `;
                });
                resResultsContainer.innerHTML = html;
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => console.error('Error fetching bookings:', error));
    });
}

// Handle Reservation Cancellation via Django Backend API
if (resResultsContainer) {
    resResultsContainer.addEventListener("click", e => {
        if (e.target.classList.contains("target-cancel-btn")) {
            const bookingId = e.target.dataset.id;
            
            if (confirm("Are you sure you want to cancel this reservation?")) {
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                // Dispatch a secure POST request to hit our backend deletion route
                fetch(`/cancel-reservation/${bookingId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Re-trigger the search form submit event to seamlessly refresh the listing layout
                        viewResForm.dispatchEvent(new Event("submit"));
                    } else {
                        alert("Cancellation failed: " + data.message);
                    }
                })
                .catch(error => console.error('Error deleting reservation:', error));
            }
        }
    });
}