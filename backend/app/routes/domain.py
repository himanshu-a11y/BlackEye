import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.history import TestRecord
from app.services.domain_service import run_domain_recon, clean_domain, validate_domain

router = APIRouter()

class DomainRequest(BaseModel):
    domain: str = Field(..., description="Target domain name (e.g. example.com)")

_domain_cache: dict = {}

@router.post("/domain/recon")
async def domain_recon(req: DomainRequest, db: AsyncSession = Depends(get_db)):
    domain = clean_domain(req.domain)
    if not validate_domain(domain):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid domain format: '{req.domain}'. Please provide a valid domain name (e.g., example.com)."
        )

    # In-memory cache check (10 minutes)
    now = datetime.utcnow().timestamp()
    if domain in _domain_cache:
        cached_time, cached_res = _domain_cache[domain]
        if now - cached_time < 600:
            return cached_res

    try:
        recon_data = await run_domain_recon(domain)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Reconnaissance failed: {str(e)}")

    test_id = f"BE-{uuid.uuid4().hex[:8].upper()}"
    ssl_info = recon_data.get("ssl", {})
    audit = recon_data.get("audit", {})
    grade = audit.get("grade", "N/A")

    # Record to DB history
    try:
        record = TestRecord(
            id=test_id,
            test_type="domain",
            target=domain,
            isp=audit.get("server_info", "")[:50],
            org=ssl_info.get("issuer", "")[:50],
            consistency_score=grade,
            raw_data=json.dumps(recon_data),
        )
        db.add(record)
        await db.commit()
    except Exception:
        # History save shouldn't block user response
        pass

    response = {
        "success": True,
        "test_id": test_id,
        "timestamp": datetime.utcnow().isoformat(),
        "domain": domain,
        "data": recon_data,
    }

    _domain_cache[domain] = (now, response)
    return response
