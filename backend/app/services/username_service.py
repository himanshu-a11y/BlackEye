import asyncio
import time
import httpx
from typing import List, Dict, Any

PLATFORMS = [
    # Developer & Tech
    {"name": "GitHub", "url": "https://github.com/{username}", "category": "Developer"},
    {"name": "GitLab", "url": "https://gitlab.com/{username}", "category": "Developer"},
    {"name": "Bitbucket", "url": "https://bitbucket.org/{username}/", "category": "Developer"},
    {"name": "DockerHub", "url": "https://hub.docker.com/u/{username}", "category": "Developer"},
    {"name": "npm", "url": "https://www.npmjs.com/~{username}", "category": "Developer"},
    {"name": "PyPI", "url": "https://pypi.org/user/{username}/", "category": "Developer"},
    {"name": "Dev.to", "url": "https://dev.to/{username}", "category": "Developer"},
    {"name": "Hashnode", "url": "https://hashnode.com/@{username}", "category": "Developer"},
    {"name": "HackerNews", "url": "https://news.ycombinator.com/user?id={username}", "category": "Developer", "check_content": "user:"},
    {"name": "LeetCode", "url": "https://leetcode.com/{username}/", "category": "Developer"},
    {"name": "Codeforces", "url": "https://codeforces.com/profile/{username}", "category": "Developer"},
    {"name": "Kaggle", "url": "https://www.kaggle.com/{username}", "category": "Developer"},
    {"name": "Replit", "url": "https://replit.com/@{username}", "category": "Developer"},

    # Social & Community
    {"name": "Reddit", "url": "https://www.reddit.com/user/{username}", "category": "Social"},
    {"name": "LinkedIn", "url": "https://www.linkedin.com/in/{username}", "category": "Social"},
    {"name": "Pinterest", "url": "https://www.pinterest.com/{username}/", "category": "Social"},
    {"name": "Medium", "url": "https://medium.com/@{username}", "category": "Social"},
    {"name": "Telegram", "url": "https://t.me/{username}", "category": "Social", "check_content": "tgme_page_title"},
    {"name": "Tumblr", "url": "https://{username}.tumblr.com", "category": "Social"},
    {"name": "Patreon", "url": "https://www.patreon.com/{username}", "category": "Social"},
    {"name": "Substack", "url": "https://{username}.substack.com", "category": "Social"},
    {"name": "Mastodon (Social)", "url": "https://mastodon.social/@{username}", "category": "Social"},
    {"name": "Keybase", "url": "https://keybase.io/{username}", "category": "Social"},
    {"name": "Linktree", "url": "https://linktr.ee/{username}", "category": "Social"},

    # Gaming & Entertainment
    {"name": "Steam", "url": "https://steamcommunity.com/id/{username}", "category": "Gaming", "check_content": "actual_persona_name"},
    {"name": "Twitch", "url": "https://www.twitch.tv/{username}", "category": "Gaming"},
    {"name": "Chess.com", "url": "https://www.chess.com/member/{username}", "category": "Gaming"},

    # Media & Creative
    {"name": "SoundCloud", "url": "https://soundcloud.com/{username}", "category": "Media"},
    {"name": "Vimeo", "url": "https://vimeo.com/{username}", "category": "Media"},
    {"name": "Spotify", "url": "https://open.spotify.com/user/{username}", "category": "Media"},
    {"name": "Behance", "url": "https://www.behance.net/{username}", "category": "Media"},
    {"name": "Dribbble", "url": "https://dribbble.com/{username}", "category": "Media"},
    {"name": "Flickr", "url": "https://www.flickr.com/people/{username}", "category": "Media"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

async def _check_one(sem: asyncio.Semaphore, client: httpx.AsyncClient, platform: Dict, username: str) -> Dict[str, Any]:
    url = platform["url"].format(username=username)
    start = time.time()
    status = "UNKNOWN"
    elapsed = 0

    async with sem:
        try:
            # If check_content is required, use GET; otherwise try GET with stream or small read
            resp = await client.get(url, timeout=5.0)
            elapsed = int((time.time() - start) * 1000)

            if resp.status_code == 200:
                check_content = platform.get("check_content")
                if check_content:
                    if check_content in resp.text:
                        status = "FOUND"
                    else:
                        status = "NOT_FOUND"
                else:
                    status = "FOUND"
            elif resp.status_code in (404, 410):
                status = "NOT_FOUND"
            elif resp.status_code == 429:
                status = "RATE_LIMITED"
            elif resp.status_code in (401, 403):
                # Many platforms block crawlers with 403 (e.g. Cloudflare)
                status = "UNKNOWN"
            else:
                status = "NOT_FOUND"
        except httpx.TimeoutException:
            status = "TIMEOUT"
            elapsed = 5000
        except Exception:
            status = "ERROR"
            elapsed = 0

    return {
        "platform": platform["name"],
        "category": platform.get("category", "General"),
        "url": url,
        "status": status,
        "response_time": elapsed,
    }

async def check_username(username: str) -> List[Dict[str, Any]]:
    # Concurrency limiter to avoid hitting rate limits or socket exhaustion
    sem = asyncio.Semaphore(15)
    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, verify=False) as client:
        tasks = [_check_one(sem, client, p, username) for p in PLATFORMS]
        results = await asyncio.gather(*tasks)

    # Sort results: FOUND first, then UNKNOWN, then NOT_FOUND
    status_priority = {"FOUND": 0, "RATE_LIMITED": 1, "UNKNOWN": 2, "TIMEOUT": 3, "ERROR": 4, "NOT_FOUND": 5}
    results.sort(key=lambda r: (status_priority.get(r["status"], 99), r["platform"]))
    return results
