import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.database import get_db
from app.models.history import TestRecord
from app.services.provider_manager import run_geolocation, validate_ip
import httpx

router = APIRouter()

class GeoRequest(BaseModel):
    ip: str

_cache: dict = {}

@router.get("/public-ip")
async def get_public_ip():
    try:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get("https://api.ipify.org?format=json")
            return {"success": True, "data": {"ip": r.json()["ip"]}}
    except Exception:
        async with httpx.AsyncClient(timeout=6) as client:
            r = await client.get("https://ipwho.is/")
            return {"success": True, "data": {"ip": r.json().get("ip")}}

@router.post("/geolocation")
async def geolocation(req: GeoRequest, db: AsyncSession = Depends(get_db)):
    ip = req.ip.strip()
    valid, err_msg = validate_ip(ip)
    if not valid:
        raise HTTPException(status_code=422, detail=err_msg)

    # Cache check
    from app.config import CACHE_TTL_SECONDS
    now = datetime.utcnow().timestamp()
    if ip in _cache:
        cached_time, cached_data = _cache[ip]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_data

    result = await run_geolocation(ip)
    normalized = result["normalized"]

    if not normalized:
        raise HTTPException(status_code=502, detail="All providers failed to return data.")

    # Save to DB
    test_id = f"BE-{uuid.uuid4().hex[:8].upper()}"
    record = TestRecord(
        id=test_id,
        test_type="geolocation",
        target=ip,
        country=normalized.get("country") or "",
        country_code=normalized.get("country_code") or "",
        region=normalized.get("region") or "",
        city=normalized.get("city") or "",
        postal=normalized.get("postal") or "",
        timezone=normalized.get("timezone") or "",
        latitude=normalized.get("latitude"),
        longitude=normalized.get("longitude"),
        isp=normalized.get("isp") or "",
        org=normalized.get("org") or "",
        asn=normalized.get("asn") or "",
        domain=normalized.get("domain") or "",
        connection_type=normalized.get("connection_type") or "",
        is_vpn=normalized.get("is_vpn"),
        is_proxy=normalized.get("is_proxy"),
        is_tor=normalized.get("is_tor"),
        is_hosting=normalized.get("is_hosting"),
        is_mobile=normalized.get("is_mobile"),
        consistency_score=result["consistency_score"],
        raw_data=json.dumps(result),
    )
    db.add(record)
    await db.commit()

    response = {
        "success": True,
        "test_id": test_id,
        "timestamp": datetime.utcnow().isoformat(),
        "ip": ip,
        "normalized": normalized,
        "providers": result["providers"],
        "consistency": result["consistency"],
        "consistency_score": result["consistency_score"],
        "errors": result["errors"],
    }
    _cache[ip] = (now, response)
    return response
