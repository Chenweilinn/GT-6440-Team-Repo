# Patient Portal – Workflow Guide

---

## 1. How to Launch the App

### Backend

```bash
cd backend
cp .env.example .env        # add your ANTHROPIC_API_KEY inside .env
pip install -r requirements.txt
uvicorn main:app --reload
# runs at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# runs at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 2. Mode A – Direct HAPI FHIR (No Login)

This is the simplest way to use the portal. Data is pulled directly from the public HAPI FHIR R4 Demo Server (`https://hapi.fhir.org/baseR4`).

```
User opens http://localhost:5173
         │
         ▼
  ┌─────────────────┐
  │  Enter Patient  │  e.g. patient ID: 131941663
  │       ID        │
  └────────┬────────┘
           │
           ▼
  Frontend calls Backend
  GET /api/fhir/patient/{id}
           │
           ▼
  Backend calls HAPI FHIR
  GET https://hapi.fhir.org/baseR4/Patient/{id}
           │
           ▼
  Portal Dashboard opens
  showing Medications, Conditions,
  Lab Results, Appointments
           │
           ▼
  Patient clicks 💬 chatbot
  asks "explain my lab result"
           │
           ▼
  Backend calls Claude API
  (with patient data as context)
           │
           ▼
  AI response shown in chat
```

**No login required.** Any valid HAPI FHIR patient ID works.

---

## 3. Mode B – SMART on FHIR EHR Launch

SMART on FHIR is an authorization standard that lets apps integrate securely with EHR systems using OAuth 2.0 + PKCE. The **SMART Health IT Launcher** simulates an EHR environment for testing.

> **Note:** In this sandbox, you log in as a **practitioner (Dr. ...)** and select a patient — simulating a clinician launching the app from within an EHR. In a real production patient portal, patients would log in with their own credentials (standalone launch).

### Setup

1. Go to **https://launch.smarthealthit.org**
2. Set **App's Launch URL** to `http://localhost:5173/launch`
3. Click **Launch**

### Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  SMART Health IT Launcher                    │
│         (simulates a hospital EHR environment)               │
└──────────────────────┬───────────────────────────────────────┘
                       │ 1. Redirects to your app with
                       │    ?iss=<fhir-server>&launch=<token>
                       ▼
             http://localhost:5173/launch
                       │
                       │ 2. LaunchPage.tsx fetches
                       │    /.well-known/smart-configuration
                       │    generates PKCE code_verifier + code_challenge
                       │    saves to sessionStorage
                       │
                       │ 3. Redirects browser to Authorization Server
                       ▼
         ┌─────────────────────────────┐
         │   SMART Launcher Login Page │
         │   You see: Dr. Smith, etc.  │
         │   → Select a practitioner   │
         │   → Select a patient        │
         └──────────────┬──────────────┘
                        │ 4. Auth server redirects to
                        │    /callback?code=<auth_code>&state=<state>
                        ▼
             http://localhost:5173/callback
                        │
                        │ 5. CallbackPage.tsx exchanges
                        │    auth code + code_verifier
                        │    for access token + patient ID
                        │
                        │ 6. Fetches Patient resource
                        │    using the access token
                        ▼
             http://localhost:5173/portal/dashboard
                        │
                        │ 7. Portal loads patient data
                        │    from the SMART FHIR server
                        │    (not HAPI — the launcher's own server)
                        ▼
                   Portal is open ✓
```

### What Each Step Does

| Step | Where | What happens |
|------|-------|--------------|
| 1 | Launcher → `/launch` | Passes FHIR server URL (`iss`) and launch token |
| 2 | `LaunchPage.tsx` | Discovers auth endpoints, generates PKCE, builds auth URL |
| 3 | Auth server | Practitioner logs in, selects patient |
| 4 | Auth server → `/callback` | Returns one-time authorization code |
| 5 | `CallbackPage.tsx` | Exchanges code for access token (PKCE verified) |
| 6 | Frontend → Backend → FHIR | Fetches patient data with Bearer token |
| 7 | Portal | Displays data, chatbot available |

---

## 4. Data Sources

| Resource | FHIR Type | Endpoint |
|----------|-----------|----------|
| Patient demographics | `Patient` | `/Patient/{id}` |
| Medications | `MedicationRequest` | `/MedicationRequest?patient={id}` |
| Diagnoses | `Condition` | `/Condition?patient={id}` |
| Lab results | `Observation` | `/Observation?patient={id}&category=laboratory` |
| Appointments | `Appointment` | `/Appointment?patient={id}` |

All data is read directly from the FHIR server — the backend stores nothing.

---

## 5. Chatbot

The chatbot uses **Claude AI** (Anthropic). When you open the chat panel:

1. The frontend fetches all patient data (medications, conditions, labs, appointments)
2. Builds a text summary and sends it to the backend with your message
3. Backend passes the patient context + message to Claude
4. Claude responds with a patient-friendly explanation

Example questions:
- *"What are my current medications?"*
- *"Explain my lab results"*
- *"Do I have any upcoming appointments?"*
- *"What does this diagnosis mean?"*

Requires `ANTHROPIC_API_KEY` set in `backend/.env`.
