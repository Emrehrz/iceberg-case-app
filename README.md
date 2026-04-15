# Iceberg Case App Boilerplate

Bu proje, ayri `frontend` ve `backend` klasorleri ile kurulu bir fullstack boilerplate'tir.

## Tech Stack

- Backend: Node.js (LTS), TypeScript, NestJS, MongoDB Atlas, Mongoose, Jest
- Frontend: Nuxt 3, Pinia, Tailwind CSS

## Proje Yapisi

- `backend`: NestJS REST API
- `frontend`: Nuxt 3 istemci uygulamasi

## Kurulum

### 1) Backend

```bash
cd backend
cp .env.example .env
pnpm install
pnpm start:dev
```

Varsayilan backend adresi: `http://localhost:4000`

Gerekli degiskenler (`backend/.env`):

- `MONGODB_URI`: Atlas baglanti string'i
- `PORT`: API portu (varsayilan 4000)
- `FRONTEND_ORIGIN`: CORS origin (varsayilan `http://localhost:3000`)

### 2) Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

Varsayilan frontend adresi: `http://localhost:3000`

Gerekli degiskenler (`frontend/.env`):

- `NUXT_PUBLIC_API_BASE`: Backend base URL (varsayilan `http://localhost:4000/api`)

## API Endpoints

- `GET /api/health`: Servis saglik kontrolu
- `GET /api/items`: Tum item'lari listeler
- `POST /api/items`: Yeni item olusturur
- `GET /api/items/:id`: Tek item getirir
- `PATCH /api/items/:id`: Item gunceller
- `DELETE /api/items/:id`: Item siler

## Hizli Smoke Test

1. Backend'i baslat (`pnpm start:dev`)
2. `GET http://localhost:4000/api/health` isteginden `status: ok` dondugunu dogrula
3. Frontend'i baslat (`pnpm dev`)
4. Ana ekranda item listesinin yüklendigini kontrol et
5. Formdan item ekleyip listenin guncellendigini dogrula

## Test

Backend testleri:

```bash
cd backend
pnpm test
```
