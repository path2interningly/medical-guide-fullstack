# Medical Guide Backend

Express.js + Prisma backend for the Medical Reference Guide application.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. `npm install`
3. `npx prisma migrate deploy`
4. `npm run dev` or `npm start`

Server runs on port 3001 by default.

## API Endpoints

- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `GET /api/entries` - List entries
- `POST /api/entries` - Create entry
- `GET /api/medical-cards` - List medical cards (filter by specialty/section)
- `POST /api/medical-cards` - Create medical card
- `PUT /api/medical-cards/:id` - Update medical card
- `GET /api/categories` - List categories
- `GET /api/links` - List links
