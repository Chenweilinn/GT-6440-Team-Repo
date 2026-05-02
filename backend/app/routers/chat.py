from fastapi import APIRouter, HTTPException
from app.models import ChatRequest
from app.config import ANTHROPIC_API_KEY

router = APIRouter()

SYSTEM_PROMPT = """You are a concise medical assistant in a patient portal.
Answer in plain text only. ABSOLUTELY NO markdown, no bullet symbols, no bold, no headers.
Be brief and direct: 1-3 sentences maximum per response.
Only reference the patient's actual health data provided below.
Always recommend consulting their healthcare provider for medical decisions.

Patient Health Data:
{context}"""


@router.post("")
async def chat(req: ChatRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="Chatbot not configured: set ANTHROPIC_API_KEY in .env")

    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        system=SYSTEM_PROMPT.format(context=req.patient_context),
        messages=messages,
    )
    return {"response": message.content[0].text}
