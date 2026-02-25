# 🎯 HydraHunt - Career Warfare AI Platform

Transform your job search with AI-powered resume building, ATS optimization, and career intelligence.

![HydraHunt](https://img.shields.io/badge/HydraHunt-Career%20AI-00FFFF?style=for-the-badge&logo=target&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

## 🚀 Features

### ✅ Implemented (Phase 1)

- **🔐 Authentication**
  - Email/password signup and login
  - Google OAuth (optional setup)
  - Session management with NextAuth.js

- **📄 Resume Management**
  - Upload resumes (PDF, DOCX, TXT)
  - AI-powered parsing and extraction
  - Full CRUD operations
  - Multiple resume support

- **🤖 AI Features**
  - ATS (Applicant Tracking System) optimization
  - Resume analysis with scoring
  - Improvement suggestions
  - Resume beautification
  - Career transition advice

- **🎨 Resume Templates**
  - Cyber (tactical theme)
  - Minimal (clean, classic)
  - Professional (corporate)
  - Creative (modern, colorful)

- **📤 Export**
  - HTML export (print to PDF)
  - Multiple template styles

- **🌍 Internationalization**
  - English, Spanish, French, Chinese

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Database**: Prisma ORM (SQLite dev / PostgreSQL prod)
- **Auth**: NextAuth.js
- **AI**: Abacus.AI API
- **State**: React Context, Hooks

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Full setup and deployment instructions
- [API Reference](./DEPLOYMENT_GUIDE.md#-api-endpoints) - All available endpoints

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `NEXTAUTH_SECRET` | Yes | Auth encryption secret |
| `NEXTAUTH_URL` | Production | Your app URL |
| `ABACUS_API_KEY` | Yes | AI features API key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |

## 📁 Project Structure

```
hydrahunt/
├── src/
│   ├── app/
│   │   ├── api/           # Backend API routes
│   │   ├── login/         # Auth pages
│   │   └── page.tsx       # Main application
│   ├── components/        # UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Core utilities
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema
├── services/              # External services
├── vercel.json            # Vercel deployment
└── netlify.toml           # Netlify deployment
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub, then import in Vercel
# Environment variables are auto-configured from .env
```

### Netlify
```bash
# Push to GitHub, then import in Netlify
# netlify.toml handles build configuration
```

See [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Login

### Resumes
- `GET /api/resumes?userId=<id>` - List resumes
- `POST /api/resumes` - Create resume
- `POST /api/resumes/upload` - Upload & parse
- `PUT /api/resumes/[id]` - Update
- `DELETE /api/resumes/[id]` - Delete
- `GET /api/resumes/[id]/export` - Export HTML

### AI Analysis
- `POST /api/analyze` - Analyze resume
  - `analysisType`: `ats` | `general` | `beautify` | `optimize`
- `POST /api/analyze/transition` - Career transition advice

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with 💚 using Next.js and AI
