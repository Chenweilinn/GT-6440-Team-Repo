from typing import Optional
import httpx
from app.config import HAPI_FHIR_BASE


async def fetch_fhir(path: str, token: Optional[str] = None, base_url: Optional[str] = None) -> dict:
    base = (base_url or HAPI_FHIR_BASE).rstrip("/")
    headers = {"Accept": "application/fhir+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{base}/{path}", headers=headers)
        resp.raise_for_status()
        return resp.json()
