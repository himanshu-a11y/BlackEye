from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.phone_service import lookup_phone

router = APIRouter()

class PhoneRequest(BaseModel):
    number: str

@router.post("/phone")
async def phone_lookup(req: PhoneRequest):
    try:
        result = lookup_phone(req.number.strip())
        return {"success": True, "data": result, "errors": []}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phone lookup failed: {e}")
