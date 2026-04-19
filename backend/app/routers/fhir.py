from typing import Optional
from fastapi import APIRouter, Query, Header, HTTPException
from app.services.fhir_client import fetch_fhir

router = APIRouter()


def _token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]
    return None


@router.get("/patient/{patient_id}")
async def get_patient(
    patient_id: str,
    fhir_base: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        return await fetch_fhir(f"Patient/{patient_id}", _token(authorization), fhir_base)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/patient/{patient_id}/medications")
async def get_medications(
    patient_id: str,
    fhir_base: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        return await fetch_fhir(f"MedicationRequest?patient={patient_id}&_count=50", _token(authorization), fhir_base)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/patient/{patient_id}/conditions")
async def get_conditions(
    patient_id: str,
    fhir_base: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        return await fetch_fhir(f"Condition?patient={patient_id}&_count=50", _token(authorization), fhir_base)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/patient/{patient_id}/labs")
async def get_labs(
    patient_id: str,
    fhir_base: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        return await fetch_fhir(
            f"Observation?patient={patient_id}&category=laboratory&_count=50",
            _token(authorization),
            fhir_base,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/patient/{patient_id}/appointments")
async def get_appointments(
    patient_id: str,
    fhir_base: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
):
    try:
        return await fetch_fhir(f"Appointment?patient={patient_id}&_count=50", _token(authorization), fhir_base)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
