from fastapi import APIRouter, Query, HTTPException
import httpx

router = APIRouter()


@router.get("/configuration")
async def get_smart_configuration(iss: str = Query(..., description="FHIR server base URL")):
    """Fetch SMART on FHIR configuration from the well-known endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{iss.rstrip('/')}/.well-known/smart-configuration")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
