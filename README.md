# Labour by Hire Network

A comprehensive platform connecting verified tradies (skilled workers) with employers looking for reliable labor services.

## 📋 Overview

**Labour by Hire Network** is a full-stack application designed to simplify the process of hiring skilled workers. The platform features:

- **Worker Authentication & Verification** - Secure sign-up/login for tradies
- **Tradie Listings** - Workers can create and manage their professional profiles
- **Job Postings** - Employers can post job opportunities
- **Urgent Notifications** - Real-time alerts for job opportunities
- **Identity Verification** - Self-validating identity badges (SVG-based security seals)

## 🏗️ Project Structure

```
Labour-by-Hire-Network/
├── backend/              # Node.js/Express API
│   ├── routes/          # API endpoints
│   ├── controllers/      # Business logic
│   ├── models/          # Database operations
│   ├── middleware/      # Authentication & middleware
│   ├── utils/           # Helper functions
│   ├── db/              # Database schema
│   └── server.js        # Entry point
├── frontend/            # Next.js web application
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── public/          # Static assets
└── index.html           # Landing page
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Frontend
- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS (or similar)
- **State Management**: React hooks/Context

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

# Create database
psql -U postgres -d labour_by_hire -f db/schema.sql

# Start development server
npm run dev
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Worker sign-up |
| `POST` | `/api/auth/login` | Worker login |
| `GET` | `/api/workers/me` | Get current worker profile |
| `POST` | `/api/listings` | Create tradie listing |
| `GET` | `/api/listings` | Browse all tradies |
| `POST` | `/api/jobs` | Post employer job |
| `GET` | `/api/jobs` | Browse all jobs |
| `GET` | `/api/notifications` | Get worker job alerts |

## ✨ Features (Phase 1)

- ✅ Worker authentication (sign-up/login)
- ✅ Tradie listings management
- ✅ Employer job postings (public)
- ✅ Urgent job notifications
- ✅ Project structure & database schema
- ⏳ Server entry point & routes (Phase 2)
- ⏳ Frontend UI components (Phase 2)

## 🔒 Security Features

- JWT-based authentication
- bcrypt password hashing
- Self-validating identity badges (SVG seals)
- CORS configuration
- Environment variable protection

## 📦 Dependencies

See `backend/package.json` and `frontend/package.json` for full dependency lists.

### Key Backend Dependencies
- express
- pg (PostgreSQL client)
- jsonwebtoken
- bcryptjs
- dotenv
- cors

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labour_by_hire
DB_USER=postgres
DB_PASSWORD=your_password

PORT=5000
NODE_ENV=development

JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

CORS_ORIGIN=http://localhost:3000
```

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Koreoner1993**

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Status**: Under Development (Phase 1 Complete, Phase 2 In Progress)
