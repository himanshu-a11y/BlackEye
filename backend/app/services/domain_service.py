import ssl
import socket
import re
import time
import asyncio
from datetime import datetime, timezone
import httpx
from typing import Dict, Any, List, Optional

DOH_PROVIDERS = [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/resolve",
]

RECORD_TYPES = {
    "A": 1,
    "NS": 2,
    "CNAME": 5,
    "SOA": 6,
    "MX": 15,
    "TXT": 16,
    "AAAA": 28,
    "CAA": 257,
}

SECURITY_HEADERS_SPEC = [
    {
        "name": "Strict-Transport-Security",
        "key": "strict-transport-security",
        "weight": 25,
        "importance": "CRITICAL",
        "description": "Enforces secure (HTTPS) connections and prevents SSL-stripping man-in-the-middle attacks.",
        "recommended": "max-age=31536000; includeSubDomains; preload",
    },
    {
        "name": "Content-Security-Policy",
        "key": "content-security-policy",
        "weight": 25,
        "importance": "CRITICAL",
        "description": "Restricts sources of executable scripts, stylesheets, and assets to mitigate XSS and data injection.",
        "recommended": "default-src 'self'; script-src 'self'; object-src 'none';",
    },
    {
        "name": "X-Frame-Options",
        "key": "x-frame-options",
        "weight": 15,
        "importance": "HIGH",
        "description": "Prevents clickjacking attacks by forbidding the page from being rendered inside an iframe or frame.",
        "recommended": "DENY or SAMEORIGIN",
    },
    {
        "name": "X-Content-Type-Options",
        "key": "x-content-type-options",
        "weight": 10,
        "importance": "HIGH",
        "description": "Stops browsers from MIME-sniffing a response away from the declared content-type.",
        "recommended": "nosniff",
    },
    {
        "name": "Referrer-Policy",
        "key": "referrer-policy",
        "weight": 10,
        "importance": "MEDIUM",
        "description": "Controls how much referrer information is sent with outbound requests to protect user privacy.",
        "recommended": "strict-origin-when-cross-origin",
    },
    {
        "name": "Permissions-Policy",
        "key": "permissions-policy",
        "weight": 10,
        "importance": "MEDIUM",
        "description": "Disables unauthorized browser APIs (geolocation, camera, microphone) on this origin.",
        "recommended": "camera=(), microphone=(), geolocation=()",
    },
    {
        "name": "Cross-Origin-Opener-Policy",
        "key": "cross-origin-opener-policy",
        "weight": 5,
        "importance": "LOW",
        "description": "Isolates the browsing context to prevent cross-origin attacks (Spectre/XS-Leaks).",
        "recommended": "same-origin",
    },
]

def clean_domain(raw: str) -> str:
    s = raw.strip().lower()
    s = re.sub(r"^https?://", "", s)
    s = s.split("/")[0]
    s = s.split(":")[0]
    return s

def validate_domain(domain: str) -> bool:
    if not domain or len(domain) > 253:
        return False
    # Standard FQDN regex
    pattern = r"^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*\.[A-Za-z]{2,63}$"
    return bool(re.match(pattern, domain))

async def fetch_dns_records(domain: str) -> Dict[str, List[Dict[str, Any]]]:
    results: Dict[str, List[Dict[str, Any]]] = {}

    async def query_type(client: httpx.AsyncClient, rtype: str, type_code: int):
        for provider in DOH_PROVIDERS:
            try:
                resp = await client.get(
                    provider,
                    params={"name": domain, "type": rtype},
                    headers={"accept": "application/dns-json"},
                    timeout=4.0
                )
                if resp.status_code == 200:
                    data = resp.json()
                    answers = data.get("Answer", [])
                    records = []
                    for ans in answers:
                        records.append({
                            "name": ans.get("name", domain),
                            "type": rtype,
                            "ttl": ans.get("TTL", 300),
                            "data": ans.get("data", "").strip('"')
                        })
                    results[rtype] = records
                    return
            except Exception:
                continue
        results[rtype] = []

    async with httpx.AsyncClient() as client:
        tasks = [query_type(client, rtype, code) for rtype, code in RECORD_TYPES.items()]
        await asyncio.gather(*tasks)

    return results

def inspect_ssl(domain: str, port: int = 443, timeout: float = 5.0) -> Dict[str, Any]:
    ssl_info: Dict[str, Any] = {
        "valid": False,
        "subject": "",
        "issuer": "",
        "valid_from": None,
        "valid_to": None,
        "days_left": 0,
        "tls_version": None,
        "cipher": None,
        "sans": [],
        "is_expired": False,
        "error": None,
    }

    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = True
        ctx.verify_mode = ssl.CERT_REQUIRED

        with socket.create_connection((domain, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                ssl_info["tls_version"] = ssock.version()
                cipher_tuple = ssock.cipher()
                ssl_info["cipher"] = cipher_tuple[0] if cipher_tuple else "Unknown"

                # Extract Subject & Issuer
                def parse_dn(dn_tuple):
                    parts = []
                    for rdn in dn_tuple or ():
                        for key, val in rdn:
                            parts.append(f"{key}={val}")
                    return ", ".join(parts)

                # Find CommonName or Org
                for rdn in cert.get("subject", ()):
                    for key, val in rdn:
                        if key in ("commonName", "organizationName"):
                            ssl_info["subject"] = val
                            break

                for rdn in cert.get("issuer", ()):
                    for key, val in rdn:
                        if key in ("commonName", "organizationName"):
                            ssl_info["issuer"] = val
                            break

                # SANs
                sans = []
                for typ, val in cert.get("subjectAltName", ()):
                    if typ == "DNS":
                        sans.append(val)
                ssl_info["sans"] = sans[:20]

                # Dates
                not_before = cert.get("notBefore")
                not_after = cert.get("notAfter")
                date_fmt = "%b %d %H:%M:%S %Y %Z"

                if not_after:
                    exp_dt = datetime.strptime(not_after, date_fmt).replace(tzinfo=timezone.utc)
                    ssl_info["valid_to"] = exp_dt.isoformat()
                    now = datetime.now(timezone.utc)
                    days_left = (exp_dt - now).days
                    ssl_info["days_left"] = days_left
                    ssl_info["is_expired"] = days_left < 0
                    ssl_info["valid"] = days_left >= 0

                if not_before:
                    from_dt = datetime.strptime(not_before, date_fmt).replace(tzinfo=timezone.utc)
                    ssl_info["valid_from"] = from_dt.isoformat()

    except ssl.SSLCertVerificationError as e:
        ssl_info["error"] = f"SSL Certificate Verification Failed: {e.verify_message}"
        ssl_info["valid"] = False
    except (socket.timeout, TimeoutError):
        ssl_info["error"] = "Connection timed out connecting to port 443"
    except ConnectionRefusedError:
        ssl_info["error"] = "Port 443 is closed or connection was refused"
    except Exception as e:
        ssl_info["error"] = str(e)

    return ssl_info

async def audit_http_headers(domain: str) -> Dict[str, Any]:
    url = f"https://{domain}"
    raw_headers = {}
    status_code = None
    redirect_chain = []
    server_str = "Hidden / Not Disclosed"
    powered_by = None

    async with httpx.AsyncClient(timeout=7.0, follow_redirects=True, headers={"User-Agent": "BlackEye-Security-Auditor/1.0"}) as client:
        try:
            resp = await client.get(url)
            status_code = resp.status_code
            raw_headers = {k.lower(): v for k, v in resp.headers.items()}
            server_str = raw_headers.get("server", "Hidden / Not Disclosed")
            powered_by = raw_headers.get("x-powered-by")
            for h in resp.history:
                redirect_chain.append(str(h.url))
            redirect_chain.append(str(resp.url))
        except Exception:
            # Try fallback to HTTP
            try:
                resp = await client.get(f"http://{domain}")
                status_code = resp.status_code
                raw_headers = {k.lower(): v for k, v in resp.headers.items()}
                server_str = raw_headers.get("server", "Hidden / Not Disclosed")
                powered_by = raw_headers.get("x-powered-by")
            except Exception as e:
                return {
                    "reachable": False,
                    "error": f"Failed to connect to target web server: {str(e)}",
                    "score": 0,
                    "grade": "F",
                    "headers_analysis": [],
                    "server_info": server_str,
                }

    # Audit each header
    total_score = 0
    headers_analysis = []

    for spec in SECURITY_HEADERS_SPEC:
        val = raw_headers.get(spec["key"])
        if val:
            status = "SECURE"
            score_earned = spec["weight"]

            # Minor penalty if CSP has unsafe-inline
            if spec["key"] == "content-security-policy" and ("'unsafe-inline'" in val or "'unsafe-eval'" in val):
                status = "WARNING"
                score_earned = int(spec["weight"] * 0.7)

            total_score += score_earned
            headers_analysis.append({
                "header": spec["name"],
                "status": status,
                "importance": spec["importance"],
                "current_value": val,
                "description": spec["description"],
                "recommendation": "Configured properly." if status == "SECURE" else "Contains unsafe directives ('unsafe-inline' or 'unsafe-eval'). Consider nonces or hashes.",
            })
        else:
            headers_analysis.append({
                "header": spec["name"],
                "status": "MISSING",
                "importance": spec["importance"],
                "current_value": None,
                "description": spec["description"],
                "recommendation": f"Add header: {spec['name']}: {spec['recommended']}",
            })

    # Penalty for disclosing server technology or PHP/Node version
    if powered_by:
        total_score = max(0, total_score - 5)
        headers_analysis.append({
            "header": "X-Powered-By (Information Leakage)",
            "status": "WARNING",
            "importance": "LOW",
            "current_value": powered_by,
            "description": "Discloses underlying backend stack / software versions to potential attackers.",
            "recommendation": "Disable or remove the X-Powered-By header in your server configuration.",
        })

    # Calculate letter grade
    if total_score >= 90:
        grade = "A+"
    elif total_score >= 80:
        grade = "A"
    elif total_score >= 65:
        grade = "B"
    elif total_score >= 50:
        grade = "C"
    elif total_score >= 30:
        grade = "D"
    else:
        grade = "F"

    return {
        "reachable": True,
        "status_code": status_code,
        "score": total_score,
        "grade": grade,
        "server_info": server_str,
        "headers_analysis": headers_analysis,
        "redirect_chain": redirect_chain,
    }

async def run_domain_recon(domain_input: str) -> Dict[str, Any]:
    domain = clean_domain(domain_input)
    if not validate_domain(domain):
        raise ValueError(f"Invalid domain name: '{domain_input}'. Please enter a valid domain like 'example.com'.")

    # Run DNS queries, SSL inspection, and HTTP header audit concurrently
    loop = asyncio.get_event_loop()
    dns_task = fetch_dns_records(domain)
    ssl_task = loop.run_in_executor(None, inspect_ssl, domain, 443, 5.0)
    audit_task = audit_http_headers(domain)

    dns_records, ssl_info, header_audit = await asyncio.gather(
        dns_task, ssl_task, audit_task
    )

    # Primary resolved IPs
    a_records = dns_records.get("A", [])
    primary_ips = [r["data"] for r in a_records if "data" in r]

    return {
        "domain": domain,
        "timestamp": datetime.utcnow().isoformat(),
        "primary_ips": primary_ips,
        "dns": dns_records,
        "ssl": ssl_info,
        "audit": header_audit,
    }
