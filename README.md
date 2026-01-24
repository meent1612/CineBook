# Project Title: CineBook
>### *Movie Ticket Booking Platform*

---

# Project Overview

### Objective

The objective of the *CineBook* is to develop a scalable and user-friendly digital platform that simplifies movie discovery, ticket booking, and theatre management across multiple cities. By integrating structured booking workflows with automated recommendations and intelligent chatbot assistance, the system aims to enhance user experience, improve operational efficiency for theatre administrators, and ensure accurate, reliable transaction handling through a robust relational database design.

The platform focuses on centralized data management, real-time availability tracking, and seamless API-driven communication between frontend and backend systems.

---

### Target Audience

- *Moviegoers* seeking a convenient platform to browse movies, view showtimes, select seats, and securely book tickets with instant confirmation.

- *Theatre administrators and operators* who require a structured system to manage movies, screening schedules, seat layouts, pricing, and performance analytics efficiently.

- *System administrators* responsible for maintaining data integrity, monitoring transactions, and ensuring smooth platform operations.

---

# Tech Stack

### 1. Backend
* *Laravel (PHP)* – REST API development, authentication, and business logic handling.

---

### 2. Frontend
* *React* – Single Page Application (SPA) development.
* *TailwindCSS/ Bootstrap / MUI* – Modern UI components and responsive design.

---

### 3. Rendering Method
* *Client-Side Rendering (CSR):* Adopted to provide a fast, interactive user experience where data is dynamically fetched from APIs without SEO dependency.

---

### 4. Database
* *Microsoft SQL Server:* Stores users, movies, theatres, auditoriums, seats, screenings, tickets, payments, popularity statistics, and FAQ responses.

---

### 5. AI Integration

* **OpenAI / Gemini API:**  Will be used for AI-assisted features such as customer support and recommending movies based on user preferences, past bookings, genre interest, trending popularity.

---

### 6. Supporting Tools
* *JWT:* Secure authentication and authorization for API access.
* *Postman:* API testing and debugging.

---

# UI Design

### [View the CineBook Design in Figma](https://www.figma.com/design/xwG7I0Ze2IkME0CqjGHBvb/CineBook?node-id=0-1&t=I3FpHCeKJvxDRzqC-1)

---

# Project Features

## 1. Main Features

* **User Management:** Guest browsing support, user registration, login, profile editing and account deletion, and booking history access.

* **Multi-Branch Theatre Selection:** Users can select their preferred theatre branch from a dropdown before browsing showtimes and booking tickets.

* **Movie Browsing & Discovery:** Browse movies under *Now Showing* and *Coming Soon* categories with movie posters, details view, and weekly showtime listings.

* **Showtime Viewing:** View weekly show schedules for all currently running movies, including multiple daily showtimes.

* **Ticket Booking System:** Select theatre branch, date, movie, showtime, seat type (regular / premium), ticket quantity, and seat selection using an interactive seat layout with unavailable seats visually disabled. Ticket summary is generated before checkout.

* **Payment Management:** Select payment method and complete ticket purchase with transaction status tracking and booking confirmation.

* **About Us and Contacts:** View About Us and Contacts pages containing emails,contacts and form to be filled by user to submit any query or suggestion.

* **Price Information Page:** Access Ticket Price static page containing theatre information, branch pricing, seat types, and holiday price variations.

* **Theatre & Screening Management:** Admin management of theatre branches, halls, seat layouts, movie schedules, pricing configuration, and weekly movie rotation.

* **Role-Based Access Control:** Three user modes — **Guest**, **User**, and **Admin** — with secure authentication and permission-based access control.

---

## 2. AI Integrated Features

* **Intelligent Movie Recommendation:**  
  Suggests personalized movie recommendations based on user preferences, past bookings, genre interest, trending popularity using AI-powered analysis.

* **Chatbot Assistant:**  
  Allows users to ask questions about:
  - Movie details and showtimes  
  - Ticket pricing and seat availability  
  - Theatre branch information  
  - Refund and cancellation policies  

* **Customer Support Automation:**  
  Handles common customer support queries, reducing manual support load and improving response speed.

> *AI features are designed to assist users in discovery, navigation, and decision-making and do not perform financial transactions.*

---

## 3. CRUD Operations

* **Users:** Create, update, delete user accounts and manage booking history.

* **Movies:** Add, update, delete, and retrieve movie information including genre, duration, language.

* **Theatre Branches & Halls:** Manage theatre branches, hall allocation, seat layouts, and pricing configuration.

* **Screenings:** Create, update, and manage weekly screening schedules and showtimes.

* **Tickets:** Book, view, and manage ticket records including seat assignments and quantities.

* **Payments:** Record, verify, and track payment transactions and statuses.

---

## 4. RESTful API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | Login for all user roles |
| GET | `/auth/profile` | Fetch logged-in user profile and relevant information |
| PUT | `/auth/profile` | Update user profile |
| DELETE | `/auth/profile` | Delete user account |
| GET | `/branches` | Fetch available theatre branches |
| GET | `/movies` | Fetch movies with filtering (now showing, coming soon) |
| GET | `/movies/{id}` | Fetch detailed movie information and weekly showtimes |
| GET | `/showtimes` | Fetch weekly show schedules for all movies |
| GET | `/seats/{screeningId}` | Fetch seat availability for a selected screening |
| POST | `/tickets/book` | Book tickets and reserve seats |
| GET | `/tickets/my-bookings` | Fetch user's booking history |
| POST | `/payments` | Process and record payment transactions |
| GET | `/admin/dasboard/movies` | View and manage movie listings |
| POST | `/admin/dasboard/movies` | Add new movies |
| PUT | `/admin/dasboard/movies/{id}` | Update movie details |
| DELETE | `/admin/dasboard/movies/{id}` | Remove movies |
| POST | `/admin/dasboard/screenings` | Create screening schedules |
| PUT | `/admin/dasboard/screenings/{id}` | Update screening schedules |
| GET | `/admin/dasboard/bookings` | View all bookings and sales reports |
| POST | `/ai/chat` | AI chatbot interaction endpoint |

---

# Milestones & Roadmap

| Milestone | Frontend | Backend |
|------|-----------|-----------|
| **Milestone 1: Platform Foundation & Admin Enablement** | • Project layout and routing setup<br>• Authentication UI (Login, Register)<br>• Navbar with Home, Show Times, About Us, Contacts, Ticket Price<br>• Home page displaying movies added by admin<br>• About Us, Contacts, Ticket Price pages UI implementation<br>• Admin dashboard UI for managing movies and schedules | • JWT authentication and role-based authorization (Guest, User, Admin)<br>• User account creation, login, profile management APIs<br>• Admin APIs for movie CRUD and screening management<br>• Core REST API structure and validation |
| **Milestone 2: Booking Engine & User Experience** | • Movie details page with weekly showtimes<br>• Branch selection dropdown<br>• Ticket booking UI flow (date, movie, showtime, seat type, quantity)<br>• Interactive seat selection layout with disabled booked seats<br>• Ticket summary and checkout UI<br>• User profile and booking history UI<br>• Weekly showtimes page |• Seat layout configuration APIs<br> • Seat availability and locking logic<br>• Ticket booking workflow APIs<br>• Payment simulation and transaction recording APIs<br>• Booking history retrieval APIs<br>• Movie popularity and analytics calculation<br>• Data indexing, validation, and performance optimization |
| **Milestone 3: AI Integration & Finalization** | • AI chatbot interface integration<br>• Recommendation UI<br>• UI refinement and accessibility improvements<br>• Error handling and loading states<br>• Final UX polish | • OpenAI / Gemini API integration<br>• Natural language chatbot processing APIs<br>• AI-powered recommendation logic<br>• Intelligent query handling and response formatting<br>• System testing, security hardening, and deployment preparation |

---
## Team members

| Name                     | ID             | Email                                | Role                       |
| ------------------------ | -------------- | ------------------------------------ | ---------------------      |
| Zumaina Tahsin           | 20220204020    | zumainatahsincat@gmail.com           | Back-end Developer         |
| Rahnuma Azra Mahjabin    | 20230104028    | mahjabin3619@gmail.com               | Back-end Developer         |
| Farzana Mim              | 20230104032    | mimmysha1417@gmail.com               | Front-end Developer        |
| Shayma Sharmeen          | 20230104043    | sshayma1612@gmail.com                | Lead & Front-end Developer |

---


