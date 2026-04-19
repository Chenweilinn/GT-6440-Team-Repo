from fastapi import APIRouter, HTTPException
from app.models import ChatRequest
from app.config import ANTHROPIC_API_KEY

router = APIRouter()

SYSTEM_PROMPT = """You are a helpful health assistant in a patient portal.
You help patients understand their own health data clearly and empathetically.
The patient's current health data is provided below as context.
Always remind patients to consult their healthcare provider for medical advice.
Keep answers concise and easy to understand.

Patient Health Data:
{context}"""


@router.post("")
async def chat(req: ChatRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="Chatbot not configured: set ANTHROPIC_API_KEY in .env")

    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT.format(context=req.patient_context),
        messages=[{"role": "user", "content": req.message}],
    )
    return {"response": message.content[0].text}
