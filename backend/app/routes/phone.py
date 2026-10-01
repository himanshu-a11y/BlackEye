import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.models.history import TestRecord
from app.services.phone_service import lookup_phone

router = APIRouter()

class PhoneRequest(BaseModel):
    number: str

@router.post("/phone")
async def phone_lookup(req: PhoneRequest, db: AsyncSession = Depends(get_db)):
    try:
        number = req.number.strip()
        result = lookup_phone(number)
        test_id = f"BE-{uuid.uuid4().hex[:8].upper()}"
        record = TestRecord(
            id=test_id,
            test_type="phone",
            target=number,
            country=result.get("country") or "",
            country_code=result.get("country_code") or "",
            timezone=", ".join(result.get("timezone") or []),
            consistency_score="",
            raw_data=json.dumps(result),
        )
        db.add(record)
        await db.commit()
        result["test_id"] = test_id
        return {"success": True, "data": result, "errors": []}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Phone lookup failed: {e}")
