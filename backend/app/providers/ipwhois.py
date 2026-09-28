"""
Provider B: ipwho.is (free, no key needed)
"""
import httpx
from typing import Dict, Any

PROVIDER_NAME = "ipwho.is"

async def fetch(ip: str) -> Dict[str, Any]:
    url = f"https://ipwho.is/{ip}"
    async with httpx.AsyncClient(timeout=8) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()

    if not data.get("success"):
        raise ValueError(data.get("message", "ipwho.is failed"))

    conn = data.get("connection", {})
    return {
        "provider": PROVIDER_NAME,
        "ip": data.get("ip"),
        "country": data.get("country"),
        "country_code": data.get("country_code"),
        "region": data.get("region"),
        "city": data.get("city"),
        "postal": data.get("postal"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "timezone": data.get("timezone", {}).get("id") if isinstance(data.get("timezone"), dict) else data.get("timezone"),
        "isp": conn.get("isp"),
        "org": conn.get("org"),
        "asn": f"AS{conn.get('asn')}" if conn.get("asn") else None,
        "domain": conn.get("domain"),
        "connection_type": data.get("type"),
        "is_vpn": None,
        "is_proxy": None,
        "is_tor": None,
        "is_hosting": None,
        "is_mobile": None,
    }
