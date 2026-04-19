import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
HAPI_FHIR_BASE: str = os.getenv("HAPI_FHIR_BASE", "https://hapi.fhir.org/baseR4")
