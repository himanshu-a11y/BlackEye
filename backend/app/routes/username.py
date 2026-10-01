from datetime import datetime
import json
import uuid
from fastapi import APIRouter, HTTPException
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.database import get_db
from app.models.history import TestRecord
from app.services.username_service import check_username

router = APIRouter()

class UsernameRequest(BaseModel):
    username: str

@router.post("/username")
async def username_enum(req: UsernameRequest, db: AsyncSession = Depends(get_db)):
    uname = req.username.strip()
    if not uname or len(uname) > 50:
        raise HTTPException(status_code=422, detail="Invalid username.")
    results = await check_username(uname)
    test_id = f"BE-{uuid.uuid4().hex[:8].upper()}"
    record = TestRecord(
        id=test_id,
        test_type="username",
        target=uname,
        consistency_score="",
        raw_data=json.dumps({"username": uname, "checks": results}),
    )
    db.add(record)
    await db.commit()
    return {
        "success": True,
        "test_id": test_id,
        "data": {
            "username": uname,
            "checks": results,
            "timestamp": datetime.utcnow().isoformat(),
        },
        "errors": [],
    }
