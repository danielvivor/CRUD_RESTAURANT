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

                // Map database results directly into visual HTML cards with dual view/edit structures
                let html = "";
                data.reservations.forEach(booking => {
                    html += `
                        <div class="result-card" id="card-${booking.id}">
                            <div class="view-mode-container">
                                <div class="status-badge">Confirmed</div>
                                <p><strong>Booking ID:</strong> RES-${booking.id}</p>
                                <p><strong>Details:</strong> <span class="disp-date">${booking.date}</span> at <span class="disp-time">${booking.time}</span></p>
                                <p><strong>Party Size:</strong> <span class="disp-guests">${booking.guests}</span> Guests</p>
                                
                                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                    <button class="btn btn-primary target-edit-btn" style="flex: 1; padding: 0.5rem;" data-id="${booking.id}">Edit</button>
                                    <button class="btn-outline target-cancel-btn" style="flex: 1; padding: 0.5rem; color: #d9534f; border-color: #d9534f;" data-id="${booking.id}">Cancel</button>
                                </div>
                            </div>

                            <div class="edit-mode-container" style="display: none; margin-top: 0.5rem;">
                                <div class="status-badge" style="background-color: var(--color-gold-dark);">Editing Mode</div>
                                <div class="form-field" style="margin-bottom: 0.5rem;">
                                    <label style="font-size: 0.85em;">New Date</label>
                                    <input type="date" class="edit-date" value="${booking.date}" required />
                                </div>
                                <div class="form-field" style="margin-bottom: 0.5rem;">
                                    <label style="font-size: 0.85em;">New Time</label>
                                    <input type="time" class="edit-time" value="${booking.time}" required />
                                </div>
                                <div class="form-field" style="margin-bottom: 1rem;">
                                    <label style="font-size: 0.85em;">Guests</label>
                                    <input type="number" class="edit-guests" value="${booking.guests}" min="1" max="20" required />
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-primary target-save-btn" style="flex: 1; padding: 0.5rem;" data-id="${booking.id}">Save</button>
                                    <button class="btn-outline target-close-btn" style="flex: 1; padding: 0.5rem;" data-id="${booking.id}">Cancel</button>
                                </div>
                            </div>
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

// Handle Inline Dashboard Actions (Edit View Toggles and Saving Updates)
if (resResultsContainer) {
    resResultsContainer.addEventListener("click", e => {
        const cardNode = e.target.closest(".result-card");
        if (!cardNode) return;

        const viewMode = cardNode.querySelector(".view-mode-container");
        const editMode = cardNode.querySelector(".edit-mode-container");
        const bookingId = e.target.dataset.id;

        // Action A: Toggle open the Edit Panel Layout
        if (e.target.classList.contains("target-edit-btn")) {
            viewMode.style.display = "none";
            editMode.style.display = "block";
        }

        // Action B: Close Edit Panel without committing data changes
        if (e.target.classList.contains("target-close-btn")) {
            editMode.style.display = "none";
            viewMode.style.display = "block";
        }

        // Action C: Collect updated data fields and dispatch HTTP POST request
        if (e.target.classList.contains("target-save-btn")) {
            const updatedDetails = {
                date: editMode.querySelector(".edit-date").value,
                time: editMode.querySelector(".edit-time").value,
                guests: editMode.querySelector(".edit-guests").value
            };

            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`/update-reservation/${bookingId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(updatedDetails)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Re-trigger form query operation to fetch clean data and reset views natively
                    viewResForm.dispatchEvent(new Event("submit"));
                } else {
                    alert("Update failed: " + data.message);
                }
            })
            .catch(error => console.error('Error modifying reservation records:', error));
        }
    });
}