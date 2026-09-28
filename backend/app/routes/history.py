import json
import csv
import io
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, or_

from app.database import get_db
from app.models.history import TestRecord

router = APIRouter()

def record_to_dict(r: TestRecord) -> dict:
    return {
        "id": r.id,
        "test_type": r.test_type,
        "target": r.target,
        "country": r.country,
        "country_code": r.country_code,
        "region": r.region,
        "city": r.city,
        "isp": r.isp,
        "asn": r.asn,
        "consistency_score": r.consistency_score,
        "timestamp": r.timestamp.isoformat() if r.timestamp else "",
    }

@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    search: str = Query("", max_length=100),
    db: AsyncSession = Depends(get_db),
):
    PAGE_SIZE = 20
    q = select(TestRecord).order_by(TestRecord.timestamp.desc())
    if search:
        like = f"%{search}%"
        q = q.where(or_(
            TestRecord.target.ilike(like),
            TestRecord.country.ilike(like),
            TestRecord.city.ilike(like),
            TestRecord.isp.ilike(like),
            TestRecord.asn.ilike(like),
        ))
    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar() or 0
    items_q = q.offset((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
    items = (await db.execute(items_q)).scalars().all()
    return {"success": True, "data": {"items": [record_to_dict(r) for r in items], "total": total, "page": page}}

@router.get("/history/export")
async def export_history(format: str = "json", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TestRecord).order_by(TestRecord.timestamp.desc()))
    records = result.scalars().all()
    rows = [record_to_dict(r) for r in records]

    if format == "csv":
        output = io.StringIO()
        if rows:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=blackeye-history.csv"}
        )
    else:
        return StreamingResponse(
            io.BytesIO(json.dumps(rows, indent=2).encode()),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=blackeye-history.json"}
        )

@router.get("/history/{id}")
async def get_record(id: str, db: AsyncSession = Depends(get_db)):
    r = await db.get(TestRecord, id)
    if not r:
        return {"success": False, "data": None, "errors": ["Not found"]}
    d = record_to_dict(r)
    try:
        d["raw_data"] = json.loads(r.raw_data or "{}")
    except Exception:
        d["raw_data"] = {}
    return {"success": True, "data": d}

@router.delete("/history/{id}")
async def delete_record(id: str, db: AsyncSession = Depends(get_db)):
    r = await db.get(TestRecord, id)
    if r:
        await db.delete(r)
        await db.commit()
    return {"success": True}

@router.delete("/history")
async def clear_history(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(TestRecord))
    await db.commit()
    return {"success": True}

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count()).select_from(TestRecord))).scalar() or 0
    today = date.today().isoformat()
    today_q = select(func.count()).select_from(TestRecord).where(
        func.date(TestRecord.timestamp) == today
    )
    today_count = (await db.execute(today_q)).scalar() or 0
    unique_q = select(func.count(func.distinct(TestRecord.target))).select_from(TestRecord)
    unique = (await db.execute(unique_q)).scalar() or 0

    scores = (await db.execute(select(TestRecord.consistency_score))).scalars().all()
    score_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    vals = [score_map.get(s, 0) for s in scores if s]
    avg = "HIGH" if not vals else (
        "HIGH" if sum(vals) / len(vals) >= 2.5 else
        "MEDIUM" if sum(vals) / len(vals) >= 1.5 else "LOW"
    )
    return {"success": True, "data": {"total_tests": total, "today_tests": today_count, "unique_ips": unique, "avg_consistency": avg}}
