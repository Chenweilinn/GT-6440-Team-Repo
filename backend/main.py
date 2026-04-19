from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import fhir, chat, smart

app = FastAPI(title="Patient Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fhir.router, prefix="/api/fhir", tags=["fhir"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(smart.router, prefix="/api/smart", tags=["smart"])


@app.get("/health")
async def health():
    return {"status": "ok"}
