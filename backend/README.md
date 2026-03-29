# Labour by Hire Backend

Backend API for the Labour by Hire platform - connecting verified tradies with employers.

## Phase 1 Features
- ✅ Worker authentication (sign-up/login)
- ✅ Tradie listings management
- ✅ Employer job postings (public)
- ✅ Urgent job notifications

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure
```
backend/
├── routes/              # API route definitions
├── controllers/         # Business logic handlers
├── models/             # Database queries and operations
├── middleware/         # Express middleware (auth, etc)
├── utils/              # Helper functions (tokens, hashing, etc)
├── db/                 # Database schema and migrations
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── server.js           # Main entry point (to be created)
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Then edit `.env` with your PostgreSQL credentials and JWT secret.

### 3. Create Database
```bash
# Create a PostgreSQL database named 'labour_by_hire'
# Then run the schema
psql -U postgres -d labour_by_hire -f db/schema.sql
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or PORT defined in .env)

## API Endpoints (Coming in Phase B)
- `POST /api/auth/register` — Worker sign-up
- `POST /api/auth/login` — Worker login
- `GET /api/workers/me` — Get current worker profile
- `POST /api/listings` — Create tradie listing
- `GET /api/listings` — Browse all tradies
- `POST /api/jobs` — Post employer job
- `GET /api/jobs` — Browse all jobs
- `GET /api/notifications` — Get worker job alerts

## Environment Variables
See `.env.example` for all required variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `PORT`, `NODE_ENV`
- `JWT_SECRET`, `JWT_EXPIRY`
- `CORS_ORIGIN`

## Phase 1 Status
- ✅ Project structure created
- ⏳ Database schema ready
- ⏳ Dependencies defined
- ⏳ Server entry point (next)
- ⏳ Routes & controllers (Phase B)
