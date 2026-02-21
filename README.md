# MedRemind

**MedRemind** is an elderly-friendly medication reminder web application designed to help users manage their prescriptions and never miss a dose. It features a robust full-stack architecture with built-in notification capabilities.

**Created by:** Elizabeth Shiju and Shreya S

---

## 🚀 Features

* **Elderly-Friendly UI**: Designed with simplicity and accessibility in mind.
* **Automated Reminders**: Integrated with **Twilio** for SMS/Voice and **Nodemailer** for email alerts.
* **AI Integration**: Utilizes the **GROQ SDK** for advanced processing or interaction.
* **Secure Auth**: User authentication powered by **JSON Web Tokens (JWT)** and **bcryptjs**.
* **Lightweight Database**: Uses **better-sqlite3** for efficient local data storage.
* **Concurrent Execution**: Runs both the client and server simultaneously using a single command.

---

## 🛠️ Tech Stack

### Frontend

* **React 18**: Core UI library.
* **Vite**: Fast build tool and development server.
* **React Router DOM**: Client-side routing management.

### Backend

* **Node.js & Express**: Server framework.
* **Better-SQLite3**: Fast SQLite3 driver for local storage.
* **Node-Cron**: Task scheduling for medication alerts.
* **Axios**: Promise-based HTTP client for API requests.

---

## 📦 Getting Started

### Prerequisites

* Node.js (latest LTS recommended)
* npm

### Installation

1. Clone the repository.
2. Install dependencies for both client and server:
```bash
npm install

```



### Environment Setup

Create a `.env` file in the root directory and configure your credentials (required for Twilio, Nodemailer, and GROQ).

### Running the Application

You can run both the frontend and the backend concurrently using the following command:

```bash
npm run dev

```

* **Frontend**: Runs on [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173).
* **Backend**: Runs on [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001) (Proxied via Vite).

---

## 🏗️ Project Structure

* `server/index.js`: Main entry point for the Express backend.
* `vite.config.js`: Configuration for the Vite build tool and API proxying.
* `package.json`: Project metadata and dependency management.

---

## 📜 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts both the Vite dev server and the Node backend concurrently. |
| `npm run dev:client` | Starts only the Vite frontend. |
| `npm run dev:server` | Starts the Node backend with `--watch` mode. |
| `npm run build` | Builds the frontend for production. |
| `npm run preview` | Previews the production build locally. |

project video
https://drive.google.com/file/d/12J7cop_eEYe03YrGaVk9ZK5gX-c2Naiq/view?usp=sharing
