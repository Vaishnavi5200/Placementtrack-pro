# PlacementTrack Pro

A personal career workspace for student developers to track job applications, manage follow-up timelines, and log data structures & algorithms (DSA) practice. Built from scratch with the MERN stack (MongoDB, Express, React, Node.js), this project replaces scattered spreadsheets and notepad files with a unified dashboard.

This is a portfolio project built to be studied, explained in technical interviews, and extended over time.

---

## 🚀 The Problems It Solves

1. **Job Hunt Organization**: It is easy to lose track of where you applied, what stages are active (Assessment, Interview, Offer), and which applications require follow-ups.
2. **Algorithm Practice Consistency**: Keeping a high-volume DSA solved count is tough without logging topics, platforms (LeetCode, HackerRank, GeeksforGeeks), revision counts, and visual day-to-day streaks to build habits.

---

## 🛠️ Features

### 1. Job Application Tracker
- **CRUD Operations**: Log, read, update, and delete job opportunities.
- **Search & Filters**: Search by company/role; filter by status, job type (full-time/internship), work mode, and application source.
- **Follow-up Reminders**: Set reminder dates to trigger follow-up alerts categorized on the dashboard as Overdue, Today, or Upcoming.
- **Status Timeline**: Embedded status histories trace exact transitions (e.g. *Wishlist ➔ Applied ➔ Assessment ➔ Interview*).

### 2. DSA Practice Tracker (New!)
- **Problem Log**: Log problem titles, platforms (LeetCode, HackerRank, GeeksforGeeks, Codeforces, InterviewBit), difficulty levels (Easy, Medium, Hard), topic tags (e.g., Dynamic Programming, Trees), and personal notes.
- **Stats Dashboard**: Reuses components to render cards tracking Total Solved, Easy/Medium/Hard breakdown, and the Current Daily Streak.
- **Daily Streak Tracker**: Custom date-handling algorithm that counts consecutive days solving problems using `solvedDate`.
- **Revision Counters**: Track how many times a problem has been reviewed to cement concept retention.

### 3. Authentication & Security
- **JWT Session Management**: Handled using JSON Web Tokens stored in `localStorage` with a custom Axios request interceptor for header injection.
- **Bcrypt Hashing**: User passwords hashed securely before saving.
- **Strict Data Isolation**: Resource ownership is verified at the controller level; users can never read, edit, or delete another student's logs.

---

## 💻 Tech Stack

- **Frontend**: React (Vite), React Router (v6), Axios, Context API, Vanilla CSS (no component frameworks for maximum styling flexibility)
- **Backend**: Node.js, Express, MongoDB, Mongoose ODM
- **Security**: JWT, bcryptjs, CORS, dotenv

---

## 📂 Codebase Structure

```text
server/
  config/         MongoDB connection helper
  controllers/    Request handling & business logic (authController, applicationController, dsaController)
  middleware/     JWT auth guards and centralized error handling
  models/         Mongoose schemas (User, Application, DsaProblem)
  routes/         Express route definitions (authRoutes, applicationRoutes, dsaRoutes)
  utils/          Shared helpers (asyncHandler, ApiError, generateToken)

client/src/
  components/     Reusable visual elements (FormField, StatCard, EmptyState, LoadingSpinner, ConfirmDialog)
  pages/          Page route controllers (Dashboard, Applications, DsaTracker, Profile, Login)
  context/        AuthContext managing token storage and login/logout handlers
  services/       Axios configuration and API resource endpoints (api, applicationService, dsaService)
  utils/          Shared date manipulation and status map constants
