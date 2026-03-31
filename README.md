# kleerFUEL 🔥

> **Total Fuel Visibility. Zero Shrinkage.**

A multi-tenant SaaS fuel management platform combining IoT tank monitoring, AI-powered OCR, offline-first PWA field operations, and automated triple-check reconciliation.

---

## Architecture

```
Frontend (React + Vite)  →  Backend (FastAPI)  →  Supabase (PostgreSQL + Auth)
     Vercel                    Render.com              Hosted
```

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # Fill in your Supabase keys
uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend/admin
npm install
cp .env.example .env.local   # Fill in your Supabase keys
npm run dev
# App running at http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### Frontend (`frontend/admin/.env.local`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

---

## Production Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — auto-deploys on every push to `main`

### Backend → Render
1. Connect GitHub repo to Render
2. Select `backend/render.yaml` as config
3. Set environment variables in Render dashboard
4. Deploy

---

## Database

Run migrations in order via Supabase SQL Editor:
1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/seed.sql` (demo data — optional)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Lucide Icons, Recharts |
| Backend | Python 3.11, FastAPI, Uvicorn, APScheduler |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| IoT | RS485/Modbus, LoRaWAN, MQTT (simulated) |
| AI/OCR | Tesseract.js (Phase 2) |
| Hosting | Vercel (frontend) + Render (backend) |
