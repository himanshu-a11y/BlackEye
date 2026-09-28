"""
Provider A: ip-api.com (free, no key needed, 45 req/min)
"""
import httpx
from typing import Optional, Dict, Any

PROVIDER_NAME = "ip-api.com"

async def fetch(ip: str) -> Dict[str, Any]:
    url = f"http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,proxy,hosting,mobile,query"
    async with httpx.AsyncClient(timeout=8) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()

    if data.get("status") != "success":
        raise ValueError(data.get("message", "ip-api failed"))

    asn_raw = data.get("as", "")
    asn = asn_raw.split(" ")[0] if asn_raw else ""

    return {
        "provider": PROVIDER_NAME,
        "ip": data.get("query"),
        "country": data.get("country"),
        "country_code": data.get("countryCode"),
        "region": data.get("regionName"),
        "city": data.get("city"),
        "postal": data.get("zip"),
        "latitude": data.get("lat"),
        "longitude": data.get("lon"),
        "timezone": data.get("timezone"),
        "isp": data.get("isp"),
        "org": data.get("org"),
        "asn": asn,
        "domain": None,
        "connection_type": None,
        "is_vpn": None,
        "is_proxy": data.get("proxy"),
        "is_tor": None,
        "is_hosting": data.get("hosting"),
        "is_mobile": data.get("mobile"),
    }
