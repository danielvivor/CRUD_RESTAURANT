# Nala Restaurant - Multi-Table Reservation System

Nala Restaurant is a full-stack, data-driven web application designed to streamline dining table allocations and customer testimonials. Built using the Django MVC (Model-Template-View) framework and a PostgreSQL database, the platform features a single-page interactive dashboard where users can create, modify, and manage dining reservations asynchronously without continuous page reloads.

---

## 1. Project Planning & Agile Methodology

This project was developed following Agile software development methodologies. All significant functionalities, bugs, and deployment tasks were broken down into distinct User Stories, prioritized, and tracked using an Agile Kanban Board.

### User Stories & Project Goals Mapping
* **EPIC 1: User Authentication & Security**
  * *User Story:* As a visitor, I can create an account and log in so that my reservation records remain isolated and secure.
  * *Goal Mapping:* Satisfies access validation and data-isolation milestones.
* **EPIC 2: Interactive Reservation Engine**
  * *User Story:* As an authenticated customer, I want to book multiple tables in a single session so that I can host large group events.
  * *Goal Mapping:* Core domain purpose handling multi-table JSON payloads.
* **EPIC 3: Booking Self-Management (CRUD)**
  * *User Story:* As a registered user, I want to view, update, or cancel my upcoming reservations.
  * *Goal Mapping:* Fulfills complete relational database manipulation criteria.
* **EPIC 4: Public Feedback & Social Proof**
  * *User Story:* As a diner, I want to submit platform reviews with star ratings to share my culinary experience with future guests.
  * *Goal Mapping:* Ancillary custom data collection and rendering implementation.
---

## 2. User Experience (UX) Design

### Design Strategy & Reasoning
* **The Single-Page Dashboard Concept:** To minimize user friction and browser loading latency, a dashboard framework was chosen. All interactive components (booking forms, management fields, and feedback panels) are anchored directly onto the main homepage.
* **Visual States & Accessibility (WCAG):** Form fields dynamically adapt based on session status. Unauthenticated visitors are met with disabled visual inputs and an explicit warning banner prompting authentication, ensuring clear task flow boundaries before data entry.
* **Responsiveness:** Built with a fluid CSS Flexbox and grid container layout (`.dashboard-grid`). On desktop resolutions, columns are aligned side-by-side to optimize wide viewports; on mobile viewports (<768px), elements wrap to a stacked 100% width grid for easy touch targets.

### Architecture & System Flow Diagrams
The application handles structural information through a synchronous relational ecosystem:

User Actions (UI Input) ──► JavaScript Fetch ──► Django Views (Control) ──► PostgreSQL DB (Storage)

---

## 3. Database Architecture & Custom Data Models (Requirements 1.3, 1.4, 7.1)

The application utilizes an object-relational database structure managed via Django's ORM layer, backed by a production PostgreSQL database instance on Heroku. It implements full CRUD data manipulation capability across two custom models.



### Model Specifications

#### 1. Built-in User Model (Django Auth)
* Handles core profile management and account security validation credentials.

#### 2. Reservation Model (Custom)
* `user`: `ForeignKey` (Links directly to Django's standard User model to enforce a strict one-to-many relationship where users own their data).
* `email`: `EmailField` (Stores contact point for the session).
* `date`: `DateField` (Enforces correct calendar formatting `YYYY-MM-DD`).
* `time`: `TimeField` (Stores individual dining window slots).
* `guests`: `IntegerField` (Tracks party sizes with built-in validation constraints).

#### 3. Review Model (Custom)
* `name`: `CharField` (Name of the reviewer).
* `email`: `EmailField` (Identifies the user submitting feedback).
* `rating`: `IntegerField` (Stores evaluation on a 1-5 star scale).
* `comment`: `TextField` (Contains written customer testimonials).
* `created_on`: `DateTimeField` (Automatically captures the timestamp of the submission).

---

## 4. Testing & Code Validation (Requirements 1.7, 4.1, 4.2)

### 4.1 Automated Python Backend Testing
Automated backend verification was implemented using Django's built-in `TestCase` framework to check views, routing, and access middleware constraints.

* **Execution Command:** `python manage.py test`
* **Test Outcome:** `OK` (100% Passing)

#### Documented Test Profiles:
* `test_authenticated_user_can_access_homepage`: Confirms that the root path resolves with a standard HTTP 200 OK code when reached by valid sessions.
* `test_anonymous_user_is_blocked_from_booking`: Validates that unauthenticated form submission intercepts are rejected or redirected, preventing anonymous database pollution.

### 4.2 JavaScript Manual Testing Matrix
Frontend browser interactions, dynamic DOM cloning, and asynchronous API payloads (`main.js`) were evaluated manually across modern web browsers.

| Category | Target Feature | Action Performed | Expected Frontend Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Functionality** | Mobile Navbar Toggle (`.nav-toggle`) | Clicked hamburger menu icon on mobile resolutions. | Toggles `aria-expanded` and toggles CSS visibility to slide menu smoothly. | **PASS** |
| **Usability** | Row Multiplier Button (`#add-table-btn`) | Clicked "+ Add Another Table". | Clones HTML5 `<template>`, increments node IDs, and appends card seamlessly. | **PASS** |
| **Usability** | Card Removal Node (`.remove-table`) | Clicked the '×' close icon on a dynamically generated row. | Locates the nearest `.table-item` container ancestor and drops it from the DOM viewport. | **PASS** |
| **Data Flow** | Async Form Push (`#multi-reservation-form`) | Completed booking cards and clicked "Confirm All Bookings". | Intercepts reload via `preventDefault()`, compiles payload to JSON, issues fetch, and unhides success modal. | **PASS** |
| **Data Flow** | Async Retrieval Link (`#view-reservation-form`) | Provided authorized account string and clicked "Find My Tables". | Executes an async GET/POST query, checks rows array, and structurally prints result nodes dynamically. | **PASS** |

### 4.3 Code Validation
* **Python:** All written backend code (`views.py`, `models.py`, `urls.py`, `admin.py`) follows Python PEP8 style guidelines with strict, standardized indentation and naming conventions.
* **HTML/CSS:** Frontend layouts have been run through the W3C Markup Validation services, showing clean, error-free markup structure.

---

## 5. Deployment Guide (Requirement 1.2)

The application is deployed live in production on Heroku, integrated with an Essential-tier Heroku PostgreSQL relational database instance.

### Local vs. Production Isolation
Environmental variables and sensitive secret values are kept completely isolated:
* **Local Space:** Settings look for a local `env.py` file to populate configuration strings (`SECRET_KEY`, `LOCAL_DB_PASS`).
* **Production Space:** `env.py` is ignored via `.gitignore`. Production configurations are securely injected directly via Heroku's Config Vars panel (`SECRET_KEY`, `DATABASE_URL`).

### Deployment Steps Execution
1. Ensure a valid `Procfile` exists specifying the WSGI web layer: `web: gunicorn nala_project.wsgi`.
2. Save project dependencies: `pip freeze > requirements.txt`.
3. Create your app via Heroku CLI: `heroku create app-name`.
4. Provision the cloud database addon: `heroku addons:create heroku-postgresql:essential-tier`.
5. Set your secret production config parameters in Heroku's environment panel.
6. Build and push your production branch: `git push heroku main`.
7. Initialize production database schema structures: `heroku run python manage.py migrate`.

---

## 6. Credits & Acknowledgements
* Core application architecture guidance, deployment protocols, and testing strategies designed in accordance with the Code Institute Full-Stack Web Development specification criteria.
