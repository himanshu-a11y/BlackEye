import asyncio
import ipaddress
from typing import List, Dict, Any, Optional
from app.providers import ipapi, ipwhois, ipinfo

PROVIDERS = [
    ("ip-api.com",  ipapi.fetch),
    ("ipwho.is",    ipwhois.fetch),
    ("ipinfo.io",   ipinfo.fetch),
]

CONSISTENCY_FIELDS = ["country", "region", "city", "isp", "asn"]

def validate_ip(ip: str) -> tuple[bool, str]:
    """Returns (is_valid, error_msg). Also checks private/reserved."""
    try:
        addr = ipaddress.ip_address(ip.strip())
        if addr.is_loopback:
            return False, f"{ip} is a loopback address (127.x.x.x). Enter a public IP."
        if addr.is_private:
            return False, f"{ip} is a private/LAN address. Enter a public IP."
        if addr.is_multicast:
            return False, f"{ip} is a multicast address. Enter a public IP."
        if addr.is_reserved:
            return False, f"{ip} is a reserved address. Enter a public IP."
        if addr.is_link_local:
            return False, f"{ip} is a link-local address. Enter a public IP."
        return True, ""
    except ValueError:
        return False, f'"{ip}" is not a valid IPv4 or IPv6 address.'


async def _fetch_one(name: str, fetcher, ip: str) -> Dict[str, Any]:
    try:
        data = await fetcher(ip)
        return {"name": name, "success": True, "data": data}
    except Exception as e:
        return {"name": name, "success": False, "data": {}, "error": str(e)}


def _normalize(results: List[Dict]) -> Dict[str, Any]:
    """Aggregate provider results into a single normalized record."""
    successful = [r for r in results if r["success"]]
    if not successful:
        return {}

    def first(field):
        for r in successful:
            v = r["data"].get(field)
            if v and str(v).strip():
                return v
        return None

    def first_bool(field):
        for r in successful:
            v = r["data"].get(field)
            if v is not None:
                return v
        return None

    lat = first("latitude")
    lon = first("longitude")
    ip_val = first("ip")
    version = "IPv6" if ":" in (ip_val or "") else "IPv4"

    return {
        "ip": ip_val,
        "version": version,
        "country": first("country"),
        "country_code": first("country_code"),
        "region": first("region"),
        "city": first("city"),
        "postal": first("postal"),
        "continent": None,
        "timezone": first("timezone"),
        "latitude": float(lat) if lat is not None else None,
        "longitude": float(lon) if lon is not None else None,
        "isp": first("isp"),
        "org": first("org"),
        "asn": first("asn"),
        "domain": first("domain"),
        "connection_type": first("connection_type"),
        "is_vpn": first_bool("is_vpn"),
        "is_proxy": first_bool("is_proxy"),
        "is_tor": first_bool("is_tor"),
        "is_hosting": first_bool("is_hosting"),
        "is_mobile": first_bool("is_mobile"),
    }


def _compute_consistency(results: List[Dict]) -> tuple[List[Dict], str]:
    successful = [r for r in results if r["success"]]
    total = len(successful)
    fields_out = []

    for field in CONSISTENCY_FIELDS:
        values = {}
        for r in successful:
            v = r["data"].get(field)
            if v:
                values[r["name"]] = str(v).strip()

        unique_vals = set(values.values())
        agreement = total - (len(unique_vals) - 1) if unique_vals else 0
        agreement = max(0, agreement)
        consistent = len(unique_vals) <= 1

        fields_out.append({
            "field": field.upper(),
            "agreement": agreement,
            "total": total,
            "values": values,
            "consistent": consistent,
        })

    # Score
    consistent_count = sum(1 for f in fields_out if f["consistent"])
    ratio = consistent_count / len(CONSISTENCY_FIELDS) if CONSISTENCY_FIELDS else 0
    if ratio >= 0.8:
        score = "HIGH"
    elif ratio >= 0.5:
        score = "MEDIUM"
    else:
        score = "LOW"

    return fields_out, score


async def run_geolocation(ip: str) -> Dict[str, Any]:
    tasks = [_fetch_one(name, fetcher, ip) for name, fetcher in PROVIDERS]
    results = await asyncio.gather(*tasks)

    normalized = _normalize(list(results))
    consistency, score = _compute_consistency(list(results))

    return {
        "normalized": normalized,
        "providers": list(results),
        "consistency": consistency,
        "consistency_score": score,
        "errors": [r["error"] for r in results if not r["success"]],
    }
