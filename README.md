# Patient Portal

A FHIR-powered patient health portal with an integrated AI chatbot. Pulls real patient data from a FHIR server and lets patients (or clinicians) ask questions about medications, lab results, conditions, and appointments using Claude AI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Python FastAPI |
| FHIR Server | HAPI FHIR R4 Demo (`hapi.fhir.org/baseR4`) |
| Auth | SMART on FHIR (OAuth 2.0 + PKCE) |
| AI Chatbot | Claude API (Anthropic) |

---

## Project Structure

```
.
├── frontend/
│   └── src/
│       ├── types/          # TypeScript interfaces for FHIR resources
│       ├── contexts/       # PatientContext (state + localStorage)
│       ├── services/       # API calls to backend
│       ├── components/     # Sidebar, PatientHeader, Chatbot
│       └── pages/          # Dashboard, Medications, Conditions, Labs, Appointments
└── backend/
    ├── main.py             # FastAPI app + serves built frontend
    └── app/
        ├── routers/        # fhir.py, chat.py, smart.py
        └── services/       # fhir_client.py (httpx proxy to FHIR)
```

---

## Running the App

### Option A – Single URL (Production-style)

Build the frontend once, then run only the backend. Everything is served from **`http://localhost:8000`**.

```bash
# 1. Build frontend
cd frontend
npm install
npm run build           # outputs to frontend/dist/

# 2. Start backend (serves API + built frontend)
cd ../backend
cp .env.example .env    # add ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://localhost:8000**

---

### Option B – Development (Two Servers)

Run backend and frontend separately with hot reload.

```bash
# Terminal 1 – Backend
cd backend
cp .env.example .env    # add ANTHROPIC_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload
# runs at http://localhost:8000

# Terminal 2 – Frontend
cd frontend
npm install
npm run dev
# runs at http://localhost:5173
```

Open **http://localhost:5173**

---

### Environment Variables

**`backend/.env`**
```
ANTHROPIC_API_KEY=your_key_here     # required for chatbot
HAPI_FHIR_BASE=https://hapi.fhir.org/baseR4   # optional override
```

---

## Usage Modes

### Mode A – Direct HAPI FHIR (No Login)

The simplest way. Data is pulled directly from the public HAPI FHIR R4 Demo Server. No authentication required.

```
User opens the app
         │
         ▼
  Enter a Patient ID          e.g. 131941663
         │
         ▼
  Frontend → Backend → HAPI FHIR
  GET /api/fhir/patient/{id}
         │
         ▼
  Portal Dashboard opens
  (Medications, Conditions, Lab Results, Appointments)
         │
         ▼
  Open 💬 chatbot → ask questions
         │
         ▼
  Backend → Claude API (with patient data as context)
         │
         ▼
  AI response in chat
```

**Demo patient ID with data:** `131941663`

---

### Mode B – SMART on FHIR EHR Launch

SMART on FHIR is an authorization standard built on OAuth 2.0 + PKCE. It allows apps to integrate securely with EHR systems. The **SMART Health IT Launcher** simulates this EHR environment for testing.

> **Note:** In the sandbox you log in as a **practitioner (Dr. ...)** and select a patient — simulating a clinician launching the app from within a hospital EHR. In a real patient-facing portal, patients would authenticate with their own credentials (standalone launch pattern).

#### Setup

1. Go to **https://launch.smarthealthit.org**
2. Set **App's Launch URL** →  `http://localhost:8000/launch` (single server(server both ui+backend))
3. Click **Launch**

#### Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  SMART Health IT Launcher                    │
│         (simulates a hospital EHR environment)               │
└──────────────────────┬───────────────────────────────────────┘
                       │ 1. Redirects to your app:
                       │    /launch?iss=<fhir-server>&launch=<token>
                       │
                       │    iss    = which FHIR server to use
                       │    launch = token identifying the EHR context
                       ▼
                  /launch (LaunchPage.tsx)
                       │
                       │ 2. Fetches iss/.well-known/smart-configuration
                       │    Generates PKCE code_verifier + code_challenge
                       │    Saves both to sessionStorage
                       │    Redirects browser to authorization server
                       ▼
         ┌─────────────────────────────┐
         │   SMART Launcher Login Page │
         │   Select a practitioner     │
         │   Select a patient          │
         └──────────────┬──────────────┘
                        │ 3. Auth server redirects to:
                        │    /callback?code=<auth_code>&state=<state>
                        ▼
                 /callback (CallbackPage.tsx)
                        │
                        │ 4. Verifies state matches sessionStorage (CSRF check)
                        │    POSTs code + code_verifier to token endpoint
                        │    Receives access_token + patient ID
                        │    Fetches Patient resource with token
                        ▼
              /portal/dashboard
                        │
                        │ 5. Portal loads all patient data
                        │    from the SMART FHIR server using Bearer token
                        ▼
                   Portal is open ✓
```

| Step | What happens |
|------|-------------|
| 1 | Launcher passes the FHIR server URL (`iss`) and a launch context token |
| 2 | App discovers OAuth endpoints, generates PKCE, redirects to auth server |
| 3 | Practitioner logs in and selects a patient in the EHR simulator |
| 4 | App exchanges one-time auth code (+ PKCE verifier) for an access token |
| 5 | Portal displays patient data fetched with the Bearer token |

---

## Data Sources

All data is read live from the FHIR server. The backend stores nothing.

| Section | FHIR Resource | Query |
|---------|--------------|-------|
| Demographics | `Patient` | `/Patient/{id}` |
| Medications | `MedicationRequest` | `/MedicationRequest?patient={id}` |
| Conditions | `Condition` | `/Condition?patient={id}` |
| Lab Results | `Observation` | `/Observation?patient={id}&category=laboratory` |
| Appointments | `Appointment` | `/Appointment?patient={id}` |

---

## Chatbot

The floating 💬 button opens an AI chat panel powered by Claude (Anthropic).

When first opened, the chatbot fetches all patient data and builds a context summary. Every message you send includes this context so Claude can answer specific questions about the patient's health records.

Example questions:
- *"What are my current medications?"*
- *"Explain my latest lab results"*
- *"Do I have any upcoming appointments?"*
- *"What does this diagnosis mean?"*

Requires `ANTHROPIC_API_KEY` in `backend/.env`.
