# GunlukIs — Daily Job Marketplace

Onion-architecture .NET 10 backend + React Native (Expo) mobile app for Istanbul-based daily job listings, applications, and real-time chat between matched parties.

## Repository layout

```
backend/   # .NET 10 solution (Domain / Application / Infrastructure / WebAPI)
mobile/    # React Native (Expo + TypeScript) client
plan.md    # Master blueprint
```

## Backend

### Prerequisites

- .NET 10 SDK
- PostgreSQL 14+ running locally
- `dotnet-ef` global tool (install with `dotnet tool install --global dotnet-ef`)

### Setup

```powershell
# 1. Create the database (adjust credentials to match appsettings.json)
psql -U postgres -c "CREATE DATABASE gunlukis"

# 2. Apply migrations
cd backend
dotnet ef database update --project src/GunlukIs.Infrastructure --startup-project src/GunlukIs.WebAPI

# 3. Run the API
dotnet run --project src/GunlukIs.WebAPI
```

Connection string and JWT secret live in `backend/src/GunlukIs.WebAPI/appsettings.json` — replace `Jwt.SecretKey` before deploying anywhere real.

Email/SMS verification codes are simulated to the API terminal via `Console.WriteLine` (see `ConsoleEmailService` / `ConsoleSmsService`).

### Endpoints

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /api/auth/register | — | Register Worker/Employer |
| POST | /api/auth/login | — | Login |
| POST | /api/auth/refresh | — | Rotate access + refresh token |
| GET | /api/jobs | Anonymous | List/filter jobs |
| GET | /api/jobs/{id} | Anonymous | Job detail |
| GET | /api/jobs/districts | Anonymous | Istanbul districts |
| GET | /api/jobs/mine | Employer | List own jobs |
| POST | /api/jobs | Employer | Create job |
| POST | /api/applications | Worker | Apply to a job |
| GET | /api/applications/mine | Worker | List own applications |
| GET | /api/applications/by-job/{jobId} | Employer | List applicants for a job |
| POST | /api/applications/{id}/accept | Employer | Accept application |
| POST | /api/applications/{id}/reject | Employer | Reject application |
| GET | /api/chat/history/{applicationId} | Worker/Employer (Accepted) | Chat history |
| Hub | /hubs/chat | Worker/Employer (Accepted) | SignalR chat |

## Mobile

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo`) — optional, npm scripts also work

### Setup

```powershell
cd mobile
npm install
npm start
```

The Expo dev server prints a QR code; open it with Expo Go (Android/iOS) or run on an emulator.

The API base URL is configured in `mobile/src/config.ts` and defaults to `http://10.0.2.2:5000` (Android emulator loopback). Override for iOS simulator or physical devices.
