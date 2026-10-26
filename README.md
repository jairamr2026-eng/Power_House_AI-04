# CarbonShield Companion
> Powerhouse Employee Sustainability Portal — Hackathon Frontend

CarbonShield Companion is an AI assistant that empowers Powerhouse employees to execute AI workloads with significantly lower carbon emissions and earn Green Points.

---

## 🚀 How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Default demo credentials**:
   - Email: `priya@powerhouse.com`
   - Password: `demo123`
   - **Simulated after-hours shortcut**: Press `Ctrl+Shift+H` on the login page to toggle after-hours policy simulation and test the "Your Workday Has Ended" and "Request Access" modals.

---

## ⚙️ .env Settings

Create a `.env` file in the project root (copied from `.env.example`):

```ini
# When true, all requests use client-side mock data with real simulated timings.
# Set to false to connect to the live backend server.
VITE_USE_MOCK=true

# Base URL of the backend API (FastAPI, Express, Supabase, etc.)
VITE_API_BASE_URL=http://localhost:8000
```

> **CORS Notice:** The FastAPI backend server must allow Cross-Origin Resource Sharing (CORS) for `http://localhost:5173`:
> ```python
> from fastapi.middleware.cors import CORSMiddleware
>
> app.add_middleware(
>     CORSMiddleware,
>     allow_origins=["http://localhost:5173"],
>     allow_credentials=True,
>     allow_methods=["*"],
>     allow_headers=["*"],
> )
> ```

---

## 🔌 Connecting the Backend

Every API call is routed through `src/api/mockApi.js`. When `VITE_USE_MOCK=false`, requests are automatically dispatched via `src/api/client.js` with `Authorization: Bearer <token>`.

### API Endpoints & Expected JSON Response Shapes

| Endpoint | Method | Purpose | Expected JSON Response Shape |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate employee & issue JWT token | `{ "token": "jwt-token-string", "user": { "id": "usr-priya-01", "name": "Priya Sharma", "email": "priya@powerhouse.com", "role": "Employee", "department": "Data & AI Engineering", "badge": "Eco Pioneer", "points": 320, "carbonSaved": 482 } }` |
| `/api/me` | `GET` | Current employee profile | `{ "id": "usr-priya-01", "name": "Priya Sharma", "email": "priya@powerhouse.com", "role": "Employee", "department": "Data & AI Engineering", "avatar": "PS", "badge": "Eco Pioneer", "points": 320, "carbonSaved": 482 }` |
| `/api/me/access-status` | `GET` | Check working hours access (Mon-Fri 9AM-6PM IST) | `{ "allowed": true, "currentTime": "Monday, 12:45 PM (Asia/Kolkata)", "organization": "Powerhouse", "workingDays": "Mon - Fri", "workingHours": "9:00 AM - 6:00 PM", "nextWorkingPeriod": "Tomorrow at 9:00 AM" }` |
| `/api/me/work-schedule` | `GET` | Official company schedule policy | `{ "organization": "Powerhouse", "workingDays": "Mon - Fri", "workDaysList": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "workingHours": "9:00 AM - 6:00 PM", "timezone": "Asia/Kolkata", "startHour": 9, "startMinute": 0, "endHour": 18, "endMinute": 0, "nextWorkingPeriod": "Tomorrow at 9:00 AM" }` |
| `/api/employee/exception-requests` | `POST` | Submit after-hours access exception | `{ "success": true, "status": "Pending", "requestId": "EXP-1042", "startTime": "19:00", "endTime": "21:00", "reason": "...", "message": "Exception request submitted and marked Pending. A supervisor must review before after-hours AI compute is permitted." }` |
| `/api/me/dashboard` | `GET` | Summary statistics for home dashboard | `{ "points": 320, "carbonSaved": 482, "gridIntensity": 640, "cleanerIn": "3h", "cleanEnergyWindowStarts": "3h 15m", "recentTasks": [...], "sevenDaySavings": [...] }` |
| `/api/me/tasks` | `GET` | Audit log of employee AI tasks | `[ { "id": "task-101", "name": "Q3 Financial Summary Report Analysis", "prompt": "...", "status": "Completed", "date": "2026-10-25 14:30", "modelUsed": "Claude Haiku", "typicalModel": "Claude Opus", "gCO2eSaved": 24, "inrSaved": 3.20, "equivalence": "3 phone charges · 0.2 km driven", "urgency": "Flexible", "quality": "Standard" } ]` |
| `/api/models` | `GET` | Catalog of AI models with carbon ratings | `[ { "id": "claude-haiku", "name": "Claude Haiku", "provider": "Anthropic", "badge": "CH", "tier": "Small", "carbonBadge": "Low", "carbonColor": "#10B981", "gCO2e": 12, "inrCost": 2.50, "barPercent": 40 } ]` |
| `/api/tasks` | `POST` | Analyze task carbon and get recommendation | `{ "taskId": "task-101", "prompt": "...", "alreadyLowCarbon": false, "isUrgent": false, "typical": { "name": "Claude Opus", "model": "Claude Opus", "carbon": 30, "cost": 4.0, "time": "12 min" }, "suggested": { "name": "CarbonShield suggestion", "model": "Claude Haiku", "carbon": 12, "cost": 2.5, "schedule": "2:00 PM", "duration": "45 min" }, "savings": { "gCO2e": 18, "inr": 1.5, "phoneCharges": 2, "kmDriven": 0.2, "text": "≈ 2 phone charges · 0.2 km approx." }, "whyRecommendation": "...", "disclaimer": { "tag": "Estimated", "source": "Source: simulated data" }, "pointsAwarded": 20, "note": "Points are earned only for verified actions during working hours." }` |
| `/api/tasks/{id}/accept` | `POST` | Schedule recommendation and credit points | `{ "success": true, "taskId": "task-101", "pointsAwarded": 20, "gCO2eSaved": 18, "task": { ... }, "note": "Points are earned only for verified actions during working hours." }` |
| `/api/me/green-points` | `GET` | Green Points balance, perks & history | `{ "balance": 320, "target": 500, "perks": [ { "id": "perk-cafe", "name": "Café Cup", "costPoints": 200, "icon": "Coffee" }, { "id": "perk-gift", "name": "Gift Card", "costPoints": 500, "icon": "Gift" }, { "id": "perk-metro", "name": "EV and Metro Pass", "costPoints": 800, "icon": "Zap" } ], "history": [ ... ], "sparkline": [ ... ], "sevenDaySavings": [ ... ] }` |
| `/api/grid/status` | `GET` | Current regional grid intensity & forecast | `{ "region": "India - South Grid (Simulated)", "currentIntensity": 640, "unit": "gCO₂/kWh", "cleanerIn": "3h", "signalNote": "Solar influx expected at 1:30 PM", "nextCleanWindow": { "time": "1:30 PM - 4:00 PM", "countdown": "Starts in 3h 15m", "intensityDrop": "Down to 370 gCO₂/kWh (-42%)" }, "disclaimer": "...", "hourlyTrend": [ { "time": "00:00", "intensity": 710 }, ... ] }` |

---

## 🎨 Design System & Carbon Equivalents

- **Palette**:
  - Primary `#123C2D` (Deep forest green)
  - Secondary `#10B981` (Emerald)
  - Tertiary `#0B1220` (Near-black navy)
  - Neutral `#64748B` (Slate)
  - Surfaces: `#F4F7FB` (Background), `#FFFFFF` (Cards), `#E8EEFF` (Soft fill)
  - Alert: Red `#DC2626` on `#FEF2F2`, Amber `#F59E0B`
- **Typography**: Headings in Plus Jakarta Sans, body in Inter.
- **Rules**:
  - Money in rupees (₹) ONLY for compute costs.
  - Green Points never show rupees; they show real-world equivalents of carbon saved:
    - 1 phone charge = 8 gCO₂e
    - 1 km driven = 120 gCO₂e
    - 1 LED bulb hour = 6 gCO₂e
    - 1 tree-day = 60 gCO₂e (label "approx.")
