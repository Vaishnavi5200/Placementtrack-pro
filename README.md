# PlacementTrack Pro

A personal career application workspace for students and early-career developers. Instead of tracking job applications across spreadsheets, notes apps, and memory, PlacementTrack Pro gives you one place to log opportunities, follow up on time, and see where your search actually stands.

This is a portfolio project built with the MERN stack (MongoDB, Express, React, Node.js), written to be studied, modified, and explained in an interview — not just deployed and forgotten.

## The problem it solves

When you're applying to internships and jobs across LinkedIn, company sites, referrals, and college portals, it's easy to lose track of:

- Where you've applied and what stage each application is in
- Which applications need a follow-up email this week
- How long an application has been sitting without a response
- Whether your search is actually converting into interviews and offers

PlacementTrack Pro answers those questions directly instead of asking you to dig through a spreadsheet.

## Features

**Authentication**
- Register, login, logout
- Session restoration after a page refresh
- Protected routes that redirect unauthenticated users to login
- JWT Bearer-token authentication with bcrypt-hashed passwords

**Application tracking**
- Add, view, edit, and delete applications
- Search by company or role, filter by status, type, work mode, and source
- Ownership enforced on every read/update/delete — users can only ever touch their own data

**Follow-up system**
- Set a next follow-up date on any application
- A dedicated Follow-ups page grouped into Overdue, Due Today, and Upcoming
- "Needs Your Attention" on the dashboard surfaces overdue follow-ups and applications that have sat in "Applied" too long without an update

**Status history timeline**
- Every application keeps a simple, embedded history of status changes (e.g. Applied → Assessment → Interview)
- A new entry is only added when the status actually changes
- Displayed as a vertical timeline on the Application Details page

**Dashboard**
- Personal greeting, active application count, and stage-by-stage breakdown
- A conversion insight that only appears once there's enough real data to be meaningful
- Recent applications and recent status activity
- A thoughtful empty state for brand-new accounts — no fake data, ever

## Tech stack

**Frontend:** React + Vite, React Router, Axios, Context API, hand-written CSS (no UI framework)

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, cors, dotenv

No TypeScript, Redux, Next.js, Firebase, GraphQL, or Docker — the goal is a stack a student can fully own and explain.

## Architecture

The request/response flow is intentionally linear and easy to trace:

```
React Page → API Service (Axios) → Express Route → Auth Middleware
    → Controller → Mongoose Model → MongoDB → JSON Response → React State/UI
```

### Folder structure

```
server/
  config/         MongoDB connection
  controllers/    Request handling and business logic
  middleware/     JWT auth guard, centralized error handling
  models/         Mongoose schemas (User, Application)
  routes/         Express route definitions
  utils/          Small shared helpers (asyncHandler, ApiError, generateToken)
  server.js       App entry point

client/src/
  components/     Reusable UI pieces (forms, cards, badges, timeline, modals)
  pages/          One component per route
  context/        AuthContext (user, token, loading, login/register/logout)
  services/       Axios instance + typed API calls per resource
  utils/          Constants and date logic shared across pages
  App.jsx         Route definitions
  main.jsx        React entry point
```

## Local setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local MongoDB or a free MongoDB Atlas cluster)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env with your own MONGO_URI and JWT_SECRET
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL should point at your backend, e.g. http://localhost:5000
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Environment variables

**server/.env**

| Variable      | Description                                  |
|---------------|-----------------------------------------------|
| `PORT`        | Port the Express server listens on           |
| `MONGO_URI`   | MongoDB connection string                     |
| `JWT_SECRET`  | Secret used to sign JWTs                      |
| `CLIENT_URL`  | Frontend origin, used for CORS                |
| `NODE_ENV`    | `development` or `production`                 |

**client/.env**

| Variable        | Description                        |
|-----------------|-------------------------------------|
| `VITE_API_URL`  | Base URL of the backend API         |

## API endpoints

**Auth**
```
POST   /api/auth/register     Create an account
POST   /api/auth/login        Log in, returns a JWT
GET    /api/auth/profile      Get the logged-in user (protected)
```

**Applications** (all protected — require `Authorization: Bearer <token>`)
```
POST   /api/applications          Create an application
GET    /api/applications          List the user's applications
                                   supports ?search=&status=&type=&workMode=&source=
GET    /api/applications/:id      Get one application
PUT    /api/applications/:id      Update an application
DELETE /api/applications/:id      Delete an application
```

## Authentication flow

1. On register/login, the backend hashes/verifies the password with bcryptjs and returns a signed JWT.
2. The frontend stores the token in `localStorage` and keeps `AuthContext` in sync.
3. A centralized Axios request interceptor attaches `Authorization: Bearer <token>` to every outgoing request — no page ever has to think about the token directly.
4. On refresh, `AuthContext` reads the stored token and calls `GET /api/auth/profile` to confirm it's still valid before restoring the session. If it's expired or invalid, the user is logged out silently.
5. `ProtectedRoute` blocks access to any private page until this check resolves.

## Ownership and security logic

Every application document stores the `user` who created it. The `protect` middleware decodes the JWT and attaches the authenticated user to `req.user` on every request. Before any read-one, update, or delete operation, the controller loads the application and checks `application.user.toString() === req.user._id.toString()`, rejecting the request with a 403 if it doesn't match. Passwords are never returned in any API response (`select: false` on the schema, plus a `toJSON` transform as a second layer of defense).

## Deployment

**1. Database — MongoDB Atlas**
- Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Add a database user and allow access from anywhere (or your Render IP) under Network Access
- Copy the connection string into `MONGO_URI`

**2. Backend — Render**
- Create a new Web Service, pointing at the `server/` directory
- Build command: `npm install`
- Start command: `npm start`
- Add the environment variables from `server/.env.example`, using your Atlas URI and setting `CLIENT_URL` to your deployed Vercel URL

**3. Frontend — Vercel**
- Import the repository, set the root directory to `client/`
- Add `VITE_API_URL` pointing at your Render backend URL
- Deploy

After both are live, double-check `CLIENT_URL` on the backend and `VITE_API_URL` on the frontend match your actual deployed URLs, or CORS will block requests.

## Learning outcomes

Building this project involved:
- Designing a REST API with proper resource ownership checks, not just authentication
- Modeling a simple embedded history pattern in MongoDB (`statusHistory`) instead of a separate collection, and deciding when that trade-off makes sense
- Centralizing cross-cutting concerns (auth token attachment, error formatting, protected routing) instead of repeating them per page/controller
- Writing date logic (overdue/due-today/upcoming, "stale" detection) by hand instead of reaching for a library, to actually understand the edge cases
- Thinking about empty, loading, and error states as first-class UI states, not afterthoughts

## Future improvements

- Email or browser notifications for due follow-ups
- CSV export of applications
- A calendar view of upcoming follow-up dates
- Server-side pagination for users with very large application lists
- Refresh tokens / shorter-lived access tokens instead of a single 30-day JWT

## Security trade-offs

For simplicity, this learning project stores the JWT in `localStorage`, which is convenient but vulnerable to XSS (any injected script can read it). A production system handling sensitive data would typically use an `httpOnly` cookie instead, so client-side JavaScript can never access the token directly, paired with CSRF protection. Token handling is fully centralized in `AuthContext` and the Axios interceptor specifically so that swapping this approach later only requires changing those two places.
