"""
Provider C: ipinfo.io (free tier, optional token for higher limits)
"""
import httpx
from typing import Dict, Any
from app.config import IPINFO_TOKEN

PROVIDER_NAME = "ipinfo.io"

async def fetch(ip: str) -> Dict[str, Any]:
    url = f"https://ipinfo.io/{ip}/json"
    headers = {}
    if IPINFO_TOKEN:
        headers["Authorization"] = f"Bearer {IPINFO_TOKEN}"

    async with httpx.AsyncClient(timeout=8, headers=headers) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()

    if "error" in data:
        raise ValueError(data["error"].get("message", "ipinfo.io failed"))

    # Parse lat/lon from "loc": "37.3861,-122.0839"
    lat, lon = None, None
    if loc := data.get("loc"):
        parts = loc.split(",")
        if len(parts) == 2:
            try:
                lat, lon = float(parts[0]), float(parts[1])
            except ValueError:
                pass

    org_raw = data.get("org", "")
    asn = org_raw.split(" ")[0] if org_raw else None
    org = " ".join(org_raw.split(" ")[1:]) if org_raw else None

    return {
        "provider": PROVIDER_NAME,
        "ip": data.get("ip"),
        "country": data.get("country"),
        "country_code": data.get("country"),
        "region": data.get("region"),
        "city": data.get("city"),
        "postal": data.get("postal"),
        "latitude": lat,
        "longitude": lon,
        "timezone": data.get("timezone"),
        "isp": org,
        "org": org,
        "asn": asn,
        "domain": data.get("hostname"),
        "connection_type": None,
        "is_vpn": data.get("privacy", {}).get("vpn") if isinstance(data.get("privacy"), dict) else None,
        "is_proxy": data.get("privacy", {}).get("proxy") if isinstance(data.get("privacy"), dict) else None,
        "is_tor": data.get("privacy", {}).get("tor") if isinstance(data.get("privacy"), dict) else None,
        "is_hosting": data.get("privacy", {}).get("hosting") if isinstance(data.get("privacy"), dict) else None,
        "is_mobile": None,
    }
