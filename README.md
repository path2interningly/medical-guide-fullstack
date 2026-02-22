# Medical Guide App

Independent medical reference guide application with dedicated frontend and backend.

## Project Structure

```
medical-guide-app/
├── backend/          # Express + Prisma API
│   ├── src/
│   ├── prisma/
│   └── package.json
└── frontend/         # React + Vite
    ├── src/
    ├── index.html
    └── package.json
```

## Quick Start

**Backend:**
```bash
cd backend
cp .env.example .env  # Update with Supabase credentials
npm install
npx prisma migrate deploy
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env  # Update with API URL
npm install
npm run dev
```

Both will use the same Supabase project as personal-dashboard, so data and accounts are shared.

## Configuration

### Supabase Connection
Both backend and frontend point to the same Supabase project. Update:
- `backend/.env` → `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `frontend/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### API Connection
- Backend runs on `http://localhost:3001` (default)
- Frontend calls backend at `VITE_API_URL` in `.env`

## Notes

- Database tables are empty (no templates/entries seeded)
- Add data via the UI or API endpoints
- Changes are persisted to the shared Supabase database
