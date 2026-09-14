# QueueLess — Frontend

A digital queue and appointment management platform that helps hospitals reduce waiting time and improve patient flow. This is the React client for QueueLess — it talks to the [QueueLess backend](https://github.com/SriKarthickKumar-R/queueless-backend), a Spring Boot REST API.

**Live demo:** https://queueless-frontend-psi.vercel.app/
**Backend repo:** https://github.com/SriKarthickKumar-R/queueless-backend

## What it does

QueueLess replaces physical hospital waiting lines with a live digital queue. Patients can book appointments and track their position in the queue in real time; doctors and administrators manage schedules and queue flow from their own dashboards.

- Role-based views for patients, doctors, and administrators
- Appointment booking and live queue position tracking
- Client-side routing across role-specific dashboards
- Communicates with the backend over a REST API

## Tech stack

- **React.js** — UI library
- **Vite** — build tool and dev server
- **React Router** — client-side routing
- **JavaScript (ES6+)**
- **CSS**
- Deployed on **Vercel**

## Architecture

This frontend is a pure client — all business logic and persistence live in the [Spring Boot backend](https://github.com/SriKarthickKumar-R/queueless-backend), which is backed by MySQL and deployed on Render. The frontend calls the backend's REST endpoints for authentication, appointment booking, and queue status.

## Getting started

```bash
# Clone the repo
git clone https://github.com/SriKarthickKumar-R/queueless-frontend.git
cd queueless-frontend

# Install dependencies
npm install

# Set the backend API URL
# create a .env file in the project root:
# VITE_API_BASE_URL=https://your-backend-url.onrender.com

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Build for production

```bash
npm run build
```

## Related repository

- Backend (Spring Boot + MySQL): https://github.com/SriKarthickKumar-R/queueless-backend

## Author

**Sri Karthick Kumar R**
[GitHub](https://github.com/SriKarthickKumar-R) · [LinkedIn](https://linkedin.com/in/srikarthickkumar-r)
