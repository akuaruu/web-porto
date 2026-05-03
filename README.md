# 🚀 Aruu's Developer Portfolio (API-Driven)

![Dashboard Screenshot](./docs/screenshot.png)

> A dynamic, highly interactive developer portfolio featuring a "Live API Playground" architecture. Built to showcase backend engineering capabilities, system thinking, and modern UI design.

## 💡 Concept
Unlike static portfolios, this project is built as a fully functional full-stack application. The frontend acts as a "Live Dashboard" that fetches real-time data from a custom Go (Golang) REST API connected to a PostgreSQL database. 

This architecture reflects my core focus as a Backend Software Engineer: building clean APIs, handling data efficiently, and designing scalable systems.

## 🛠️ Tech Stack

**Backend (RESTful API)**
*   **Language:** Go (Golang)
*   **Database:** PostgreSQL
*   **Driver/Tools:** `jackc/pgx/v5` (Connection Pool), `godotenv`
*   **Security:** JWT Authentication (`golang-jwt`), Custom CORS & Logger Middleware
*   **Architecture:** Clean Architecture (Handler, Usecase, Repository)

**Frontend (Live Dashboard)**
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

## ✨ Key Features
*   **Bento Grid UI:** A modern, dark-mode terminal aesthetic tailored for the Linux/hacker vibe.
*   **Live API Integration:** The dashboard fetches projects, system status, and (soon) activity logs directly from the local Go server.
*   **JWT Protected Routes:** Secure endpoints for creating, updating, and deleting portfolio data.
*   **Decoupled Architecture:** Clear separation of concerns between the Go backend engine and the Next.js presentation layer.

## 🚀 Getting Started

If you want to run this project locally, you will need **Go**, **Node.js**, and **PostgreSQL** installed on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/akuaruu/web-porto.git](https://github.com/akuaruu/web-porto.git)
cd web-porto
