from pydantic import BaseModel
from typing import List


class HistoryMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    patient_context: str
    history: List[HistoryMessage] = []
