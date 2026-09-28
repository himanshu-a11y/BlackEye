from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.username_service import check_username

router = APIRouter()

class UsernameRequest(BaseModel):
    username: str

@router.post("/username")
async def username_enum(req: UsernameRequest):
    uname = req.username.strip()
    if not uname or len(uname) > 50:
        raise HTTPException(status_code=422, detail="Invalid username.")
    results = await check_username(uname)
    return {
        "success": True,
        "data": {
            "username": uname,
            "checks": results,
            "timestamp": datetime.utcnow().isoformat(),
        },
        "errors": [],
    }
