# Property Dealer CRM

A full-stack **Customer Relationship Management** system for property dealers built with **Next.js 16**, **MongoDB**, and **Mongoose**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (jose) + bcryptjs |
| Styling | Tailwind CSS v4 |
| Email | Nodemailer |
| Validation | Zod |

## Features

- **Authentication** — JWT-based login/signup with role-based access (Admin/Agent)
- **RBAC** — `proxy.ts` route protection, admin-only pages, role-based data filtering
- **Lead Management** — Full CRUD with search, filters, pagination
- **Lead Scoring** — Automatic scoring based on budget, source, and completeness
- **Agent Management** — Admin view of all agents with assignment capability
- **Lead Assignment** — Assign/reassign leads to agents with email notifications
- **WhatsApp Integration** — One-click chat with pre-filled messages
- **Email Notifications** — Nodemailer templates for new leads and assignments
- **Activity Timeline** — Chronological audit trail on each lead
- **Follow-up Reminders** — Set/clear follow-up dates with overdue alerts
- **Analytics Dashboard** — Stats cards, donut charts, bar charts, agent performance
- **Notification Bell** — Polling-based notification system with unread badges

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** running locally or a cloud instance (MongoDB Atlas)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd property_crm
npm install
```

### Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/property_crm
SESSION_SECRET=your-32-character-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional — email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Seed the Database

```bash
npm run seed
```

This creates:
- **Admin**: `admin@crm.com` / `admin123`
- **Agent**: `agent@crm.com` / `agent123`
- **8 sample leads** with realistic Pakistani property data
- **Activity records** for the timeline

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
property_crm/
├── app/
│   ├── (auth)/            # Login & Signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Protected dashboard layout
│   │   ├── admin/         # Admin dashboard & agents
│   │   ├── agent/         # Agent dashboard
│   │   ├── leads/         # Lead list, detail, edit, new
│   │   └── settings/      # User settings
│   ├── _components/       # Shared UI components
│   ├── _lib/              # DAL, session, scoring, email
│   ├── actions/           # Server Actions
│   └── api/               # API Route Handlers
│       ├── auth/
│       ├── leads/
│       ├── agents/
│       ├── analytics/
│       ├── follow-ups/
│       └── notifications/
├── models/                # Mongoose schemas
│   ├── User.ts
│   ├── Lead.ts
│   └── Activity.ts
├── scripts/seed.ts        # Database seeder
├── proxy.ts               # Route protection middleware
└── .env.example           # Environment template
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crm.com | admin123 |
| Agent | agent@crm.com | agent123 |

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/leads` | Auth | List leads (filtered by role) |
| POST | `/api/leads` | Auth | Create a lead |
| GET | `/api/leads/[id]` | Auth | Get lead details |
| PUT | `/api/leads/[id]` | Auth | Update a lead |
| DELETE | `/api/leads/[id]` | Admin | Delete a lead |
| POST | `/api/leads/[id]/assign` | Admin | Assign lead to agent |
| POST | `/api/leads/[id]/follow-up` | Auth | Set follow-up date |
| DELETE | `/api/leads/[id]/follow-up` | Auth | Clear follow-up |
| GET | `/api/leads/[id]/timeline` | Auth | Activity timeline |
| GET | `/api/agents` | Admin | List all agents |
| GET | `/api/analytics` | Admin | Dashboard analytics |
| GET | `/api/follow-ups` | Auth | Follow-up list |
| GET | `/api/notifications` | Auth | Notifications |
