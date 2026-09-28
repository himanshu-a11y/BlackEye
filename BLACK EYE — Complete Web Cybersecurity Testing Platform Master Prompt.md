# BLACK EYE — COMPLETE WEB CYBERSECURITY TESTING PLATFORM

You are an expert full-stack engineer, cybersecurity UI/UX designer, and frontend animation specialist.

Build a complete, production-quality web application called **BLACK EYE**.

This is NOT a simple demo or static mockup.

Build a functional, polished cybersecurity testing / OSINT-style web platform with a premium dark security aesthetic, smooth animations, responsive design, proper backend architecture, API integration, validation, error handling, loading states, and documentation.

The application should feel like a professional cybersecurity tool similar in quality to modern security dashboards and terminal-inspired security platforms.

---

# 1. PROJECT IDENTITY

## Name

**BLACK EYE**

## Tagline

**Security Testing & Network Intelligence**

Alternative small tagline:

**Observe. Analyze. Verify.**

## Purpose

BlackEye is an educational and authorized-security-testing platform focused initially on:

- IP geolocation testing
- Public IP discovery
- Network intelligence
- ASN / ISP information
- VPN / proxy / hosting indicators where available
- Public username enumeration
- Phone-number metadata
- Test history
- Result verification
- Visualization

The application must be transparent about the limitations of IP geolocation.

---

# 2. CRITICAL ACCURACY RULE

The application MUST NOT claim that an IP address provides someone's exact physical location.

Always distinguish:

### IP GEOLOCATION

Approximate network location derived from IP intelligence databases.

versus:

### DEVICE/BROWSER GEOLOCATION

Potentially precise device coordinates obtained through browser/device location services and explicit user permission.

The current version MUST NOT implement browser GPS or `navigator.geolocation`.

Reserve that functionality for a future upgrade.

Never implement:

- covert tracking
- hidden GPS collection
- silent location collection
- phishing
- credential theft
- malware
- unauthorized tracking
- browser fingerprint harvesting
- credential harvesting

---

# 3. CURRENT VERSION FEATURES

Build these modules:

```text
1. IP Geolocation Test
2. Public IP Discovery
3. Network Intelligence
4. Phone Number Metadata
5. Username Enumeration
6. Test History
7. Settings
8. About / Methodology
```

Future feature placeholder:

```text
9. Consent-Based Device Geolocation
```

Do NOT implement #9 yet.

---

# 4. TECHNOLOGY STACK

Use a modern stack.

Preferred:

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React icons

If the existing environment strongly favors another equivalent stack, use the most stable modern alternative, but maintain the same architecture and UX.

### Backend

Prefer:

- Python
- FastAPI

Use REST APIs between frontend and backend.

### Database

Use SQLite for local development.

Design the database layer so it can later be migrated to PostgreSQL.

### Environment

Use:

```text
.env
```

Never hard-code API keys.

Provide:

```text
.env.example
```

---

# 5. PROJECT ARCHITECTURE

Create a clean structure similar to:

```text
BlackEye/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── animations/
│   │   └── App.tsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   ├── geolocation.py
│   │   │   ├── network.py
│   │   │   ├── phone.py
│   │   │   ├── username.py
│   │   │   └── history.py
│   │   │
│   │   ├── services/
│   │   │   ├── ip_service.py
│   │   │   ├── provider_manager.py
│   │   │   ├── phone_service.py
│   │   │   └── username_service.py
│   │   │
│   │   ├── providers/
│   │   │   ├── provider_a.py
│   │   │   ├── provider_b.py
│   │   │   └── provider_c.py
│   │   │
│   │   ├── models/
│   │   └── utils/
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── tests/
│
├── README.md
├── .gitignore
└── docker-compose.yml
```

Keep frontend and backend modular.

Do not put everything in one giant file.

---

# 6. VISUAL DESIGN

This is extremely important.

The website must look PREMIUM.

Do not make it look like a generic Bootstrap dashboard.

Use a:

## Dark Cybersecurity / SOC / Terminal aesthetic

Primary background:

```text
#050505
#080808
#0B0F0D
```

Cards:

```text
#0D1110
#101513
```

Accent:

```text
Cyber green
```

Secondary accents:

```text
Cyan
```

Warnings:

```text
Amber
```

Errors:

```text
Red
```

Use subtle gradients.

Use glowing borders very sparingly.

Use glassmorphism only where it improves the design.

Avoid excessive neon.

The final product should feel sophisticated rather than "hacker movie".

---

# 7. TYPOGRAPHY

Use:

### Primary UI

Inter / Geist / equivalent modern sans-serif.

### Technical data

JetBrains Mono / IBM Plex Mono / equivalent monospace font.

Use monospace for:

- IP addresses
- ASN
- coordinates
- timestamps
- API response values
- test IDs
- network information

---

# 8. LANDING / DASHBOARD

Create an impressive dashboard.

Header:

```text
BLACK EYE
Security Testing & Network Intelligence
```

Navigation:

```text
Dashboard
IP Geolocation
Network Intelligence
Phone Intelligence
Username Enumeration
History
Settings
About
```

Top-right:

```text
SYSTEM ONLINE
```

with a subtle pulsing green indicator.

---

# 9. HERO SECTION

Dashboard hero:

```text
BLACK EYE

Security Testing &
Network Intelligence

Analyze network information,
verify IP intelligence, and
perform authorized security research.

[ START IP TEST ]
[ DETECT MY IP ]
```

Add subtle animated background.

Ideas:

- animated grid
- faint network nodes
- moving data particles
- subtle scanline
- glowing radial gradient
- slowly moving grid
- network connection lines

Do NOT overdo animations.

The page must remain professional.

---

# 10. TERMINAL-STYLE ELEMENT

Include a terminal-inspired component somewhere on the dashboard.

Example:

```text
┌─ BLACK EYE TERMINAL ──────────────────────┐

$ system.status

[✓] API Gateway        ONLINE
[✓] Geolocation        READY
[✓] Network Analysis  READY
[✓] Database           ONLINE

$ blackeye --status

System operational.

└───────────────────────────────────────────┘
```

Animate terminal lines appearing gradually.

Use monospace typography.

---

# 11. IP GEOLOCATION TEST

This is the primary feature.

Page:

```text
IP GEOLOCATION TEST
```

Input:

```text
Enter IPv4 or IPv6 address
```

Buttons:

```text
RUN TEST
USE MY PUBLIC IP
```

Add validation.

Accept:

- IPv4
- IPv6

Reject:

- malformed addresses
- invalid values

Detect:

- private IP
- loopback
- reserved
- multicast where applicable

Display useful explanation instead of a generic error.

---

# 12. IP TEST LOADING ANIMATION

When the user clicks Run Test, don't instantly show results.

Show a professional scanning animation:

```text
INITIALIZING TEST
      ↓
VALIDATING TARGET
      ↓
QUERYING PROVIDERS
      ↓
NORMALIZING DATA
      ↓
VERIFYING RESULTS
      ↓
TEST COMPLETE
```

Use Framer Motion.

Example visual:

```text
[████████████████░░░░] 82%
```

with technical status messages.

Make loading take only as long as needed.

Never artificially delay excessively.

---

# 13. IP RESULT DASHBOARD

After completion, display a beautiful result page.

Sections:

## Target

```text
IP Address
IPv4 / IPv6
Test Timestamp
Test ID
```

## Location

```text
Country
Country Code
Region
City
Postal Code
Continent
Timezone
Latitude
Longitude
```

## Network

```text
ISP
Organization
ASN
Domain
Connection Type
```

## Risk / Infrastructure

Where supported:

```text
VPN
Proxy
Tor
Hosting / Datacenter
Mobile Network
```

Do not invent information when unavailable.

Show:

```text
Not available
```

instead.

---

# 14. ACCURACY / VERIFICATION SYSTEM

This is one of the most important features.

Use multiple legitimate IP intelligence providers where API access permits.

Create a provider abstraction:

```text
Provider Manager
      │
 ┌────┼────┐
 │    │    │
 A    B    C
```

Normalize their results.

Then compare:

```text
Country Agreement
Region Agreement
City Agreement
ISP Agreement
ASN Agreement
```

Example:

```text
VERIFICATION

Country     ██████████  3/3
Region      ███████░░░  2/3
City        ███████░░░  2/3
ISP         ██████████  3/3
ASN         ██████████  3/3
```

Show:

```text
Consistency: HIGH
```

or:

```text
Consistency: MEDIUM
```

or:

```text
Consistency: LOW
```

Important:

Do NOT call this a scientifically calculated certainty score.

Call it:

**Provider Consistency**

---

# 15. PROVIDER DISAGREEMENT

If providers disagree, don't hide it.

Show:

```text
⚠ PROVIDER DISAGREEMENT

Provider A:
City: Jaipur

Provider B:
City: Ajmer

Provider C:
City: Jaipur

Result:
City-level data is inconsistent.
```

This increases the credibility of BlackEye.

---

# 16. ACCURACY NOTICE

Always show a subtle information box:

```text
ⓘ IP GEOLOCATION LIMITATION

IP geolocation estimates the geographic area
associated with a network address.

It does NOT provide exact GPS coordinates
or prove the physical location of a device.

VPNs, proxies, mobile networks, CGNAT,
corporate networks, and ISP routing can
reduce accuracy.
```

Make this expandable/collapsible.

---

# 17. MAP

Include an interactive map.

Show the approximate IP location.

Use a clear marker.

Add a circle if the provider gives an accuracy radius.

The map must display:

```text
Approximate IP Location
```

Never label it:

```text
Exact Location
```

If coordinates are unavailable, show a useful empty state.

---

# 18. NETWORK INTELLIGENCE PAGE

Create a dedicated page:

```text
NETWORK INTELLIGENCE
```

Display:

```text
ASN
ISP
Organization
Reverse DNS
Domain
Connection Type
Hosting
VPN
Proxy
Tor
Mobile
```

Use technical cards.

Example:

```text
AS15169
GOOGLE

ISP
Google LLC

NETWORK TYPE
Datacenter / Backbone

DOMAIN
google.com
```

Only display data actually returned by providers.

---

# 19. PUBLIC IP DISCOVERY

Button:

```text
DETECT MY PUBLIC IP
```

Flow:

```text
Detecting public IP
       ↓
IP discovered
       ↓
Run geolocation test
       ↓
Display result
```

Show:

```text
YOUR PUBLIC IP

xxx.xxx.xxx.xxx
```

Then allow:

```text
[ RUN GEOLOCATION TEST ]
```

---

# 20. PHONE NUMBER METADATA

Create:

```text
PHONE INTELLIGENCE
```

Input:

```text
+91XXXXXXXXXX
```

Display only legitimate metadata:

```text
International Format
Country
Country Code
Carrier
Timezone
Number Type
Validity
```

Do NOT claim:

- exact person location
- live GPS
- owner's identity
- private subscriber information

Add:

```text
Phone metadata does not provide live device location.
```

---

# 21. USERNAME ENUMERATION

Create:

```text
USERNAME ENUMERATION
```

Input:

```text
Enter username
```

Check public profile URLs only.

Platforms can include:

```text
GitHub
GitLab
Reddit
X
```

Display:

```text
GitHub       FOUND
GitLab       NOT FOUND
Reddit       FOUND
X            UNKNOWN
```

Add links to public profiles.

Handle:

- rate limits
- timeouts
- HTTP errors
- unavailable services

Do not attempt login or credential testing.

---

# 22. TEST HISTORY

Create:

```text
TEST HISTORY
```

Save:

```text
Test ID
IP
Timestamp
Country
Region
City
ISP
ASN
Provider Consistency
```

Example:

```text
# BE-20260812-001
8.8.8.8
United States
Google LLC
AS15169
HIGH
12 Aug 2026 20:10
```

Add:

```text
Search
Filter
Sort
Delete
Clear History
Export JSON
Export CSV
```

Use SQLite.

---

# 23. TEST DETAILS PAGE

Clicking a history record should open:

```text
TEST DETAILS

Test ID
Target
Timestamp

GEOLOCATION
...

NETWORK
...

PROVIDER COMPARISON
...

RAW NORMALIZED DATA
...
```

Provide a collapsible technical JSON section.

Do not expose API secrets.

---

# 24. SETTINGS

Create:

```text
SETTINGS
```

Sections:

### Appearance

```text
Dark
System
```

Primary theme remains cybersecurity dark.

### API Configuration

Show provider status:

```text
Provider A     CONNECTED
Provider B     NOT CONFIGURED
Provider C     CONNECTED
```

Never show the actual API keys.

### Data

```text
Clear Local History
Export History
```

---

# 25. ABOUT / METHODOLOGY

Create a professional About page.

Explain:

```text
What is IP geolocation?
How does IP intelligence work?
Why isn't IP geolocation exact?
What affects accuracy?
What is ASN?
What is an ISP?
What is a VPN?
What is CGNAT?
```

Include:

```text
IP GEOLOCATION ≠ GPS
```

This is important for the credibility of the project.

---

# 26. ANIMATION SYSTEM

Use Framer Motion consistently.

Animations should include:

### Page transitions

Smooth fade + slight slide.

### Cards

Subtle hover elevation.

### Buttons

Tiny scale interaction.

### Results

Cards appear sequentially.

### Terminal

Characters/lines appear smoothly.

### Scan

Animated progress.

### Map

Smooth marker transition.

### Sidebar

Smooth collapse/expand.

### Notifications

Slide/fade.

Avoid excessive animation.

No flashing.

No seizure-inducing effects.

Maintain good performance.

---

# 27. MICRO-INTERACTIONS

Add polished details:

- copy IP button
- copy coordinates
- copy ASN
- tooltip on technical fields
- success toast
- error toast
- loading skeletons
- keyboard shortcuts
- hover states
- animated status indicators

Example:

```text
IP Address
203.xxx.xxx.xxx     [COPY]
```

Click:

```text
✓ Copied
```

---

# 28. RESPONSIVE DESIGN

Must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop:

```text
Sidebar | Main Dashboard
```

Mobile:

```text
Top navigation
Main content
```

Tables should become cards on small screens.

Map must remain usable on mobile.

---

# 29. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- ARIA labels where appropriate
- accessible buttons
- reduced-motion support

Respect:

```text
prefers-reduced-motion
```

If enabled, reduce animations.

---

# 30. SECURITY

Implement:

- backend API key protection
- environment variables
- input validation
- rate limiting
- CORS configuration
- request timeout
- safe error handling
- no API key exposure in frontend
- no stack traces in production
- sanitized user input
- SQL parameterization
- secure HTTP headers where appropriate

Do not trust frontend validation alone.

Validate again on backend.

---

# 31. API DESIGN

Create endpoints similar to:

```text
GET  /api/health

GET  /api/public-ip

POST /api/geolocation

POST /api/phone

POST /api/username

GET  /api/history

GET  /api/history/{id}

DELETE /api/history/{id}

DELETE /api/history
```

Use proper HTTP status codes.

Return consistent JSON.

Example:

```json
{
  "success": true,
  "data": {},
  "errors": [],
  "meta": {}
}
```

---

# 32. ERROR STATES

Every API operation needs proper UI states.

Examples:

```text
INVALID INPUT
```

```text
API RATE LIMIT
```

```text
PROVIDER UNAVAILABLE
```

```text
NETWORK ERROR
```

```text
NO DATA AVAILABLE
```

```text
PROVIDER DISAGREEMENT
```

Make error messages understandable.

Never display:

```text
Internal Server Error
```

without context.

---

# 33. EMPTY STATES

Create polished empty states.

Example:

```text
NO TEST RESULTS

Run your first IP geolocation test
to see network intelligence here.

[ RUN FIRST TEST ]
```

---

# 34. DASHBOARD STATISTICS

Dashboard can display:

```text
TOTAL TESTS
TODAY'S TESTS
UNIQUE IPS
PROVIDER AGREEMENT
```

Example:

```text
┌────────────┐
│ 128        │
│ Total Tests│
└────────────┘

┌────────────┐
│ 24         │
│ Today      │
└────────────┘
```

Do not manufacture statistics.

Use actual database values.

---

# 35. CLI / TERMINAL VISUAL STYLE

Even though this is now a web app, preserve BlackEye's terminal identity.

Use components such as:

```text
$ blackeye --scan
> validating target
> querying provider
> normalizing response
> verification complete
```

Use monospace text and subtle green/cyan highlights.

---

# 36. LOGGING

Backend should log:

- request type
- timestamp
- execution duration
- provider status
- errors

Do NOT log sensitive API keys.

Do NOT unnecessarily log private user information.

---

# 37. CACHING

Implement sensible caching for repeated IP queries.

For example:

```text
Same IP
+
Recent result
=
Reuse cached result
```

Respect provider terms and rate limits.

Make cache duration configurable.

---

# 38. RATE LIMITING

Implement backend rate limiting.

Prevent accidental API abuse.

Example:

```text
60 requests/minute
```

Make the value configurable.

---

# 39. TESTING

Create automated tests for:

### IP validation

```text
8.8.8.8
1.1.1.1
127.0.0.1
192.168.1.1
invalid
999.999.999.999
IPv6 examples
```

### API

Test:

- success
- timeout
- rate limit
- provider failure
- missing fields
- disagreement

### Phone

Test:

- valid number
- invalid number
- malformed input

### Username

Test:

- found
- not found
- timeout
- rate limit

---

# 40. PERFORMANCE

Optimize:

- API requests
- database queries
- frontend bundle
- animations
- map rendering

Do not block the UI.

Use async requests where appropriate.

---

# 41. SEO / METADATA

Add:

```text
Title:
BlackEye — Security Testing & Network Intelligence

Description:
Professional IP geolocation and network intelligence testing platform.
```

Use proper favicon.

Create BlackEye branding.

---

# 42. LOGO

Create a simple BlackEye logo.

Concept:

```text
◉
```

combined with:

```text
BLACK EYE
```

Possible icon concept:

- stylized eye
- radar
- network node
- scan ring

Keep it professional.

Do not use copyrighted logos.

---

# 43. THEME DETAILS

Use subtle visual effects:

```text
radial glow
grid background
scan line
network nodes
soft green glow
cyan highlights
```

Example dashboard background:

```text
dark black
+
very subtle green radial gradient
+
very faint grid
```

Do not make the entire page neon green.

---

# 44. COMMAND PALETTE

Add keyboard shortcut:

```text
CTRL + K
```

Open:

```text
BLACK EYE COMMAND CENTER
```

Options:

```text
Search IP Geolocation
Detect Public IP
Phone Intelligence
Username Enumeration
History
Settings
```

This will make the application feel much more polished.

---

# 45. NOTIFICATION SYSTEM

Create toast notifications:

```text
✓ Test completed
✓ Result copied
✓ History saved
⚠ Provider unavailable
✕ Invalid IP
```

---

# 46. FIRST LOAD EXPERIENCE

On first load:

1. Show BlackEye logo.
2. Subtle eye/radar animation.
3. Small terminal boot sequence.
4. Transition into dashboard.

Example:

```text
BLACK EYE
INITIALIZING...

[✓] CORE
[✓] API ENGINE
[✓] NETWORK ENGINE
[✓] DATABASE
[✓] SECURITY CHECK

SYSTEM READY
```

Keep it short.

Do not delay the user unnecessarily.

---

# 47. DARK CYBERSECURITY DASHBOARD LAYOUT

Desktop layout:

```text
┌─────────────────────────────────────────────────────────┐
│ BLACK EYE                         SYSTEM ONLINE ●       │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│ Dashboard    │  BLACK EYE                               │
│              │  Security Testing & Network Intelligence │
│ IP Geo       │                                          │
│ Network      │  [ Enter IP................ ] [SCAN]     │
│ Phone        │                                          │
│ Username     │  ┌────────┐ ┌────────┐ ┌────────┐       │
│ History      │  │ Tests  │ │ Today  │ │ Status │       │
│ Settings     │  └────────┘ └────────┘ └────────┘       │
│ About        │                                          │
│              │  Recent Tests                            │
│              │  ┌────────────────────────────────────┐  │
│              │  │ IP       Location       Status     │  │
│              │  │ ...      ...            HIGH       │  │
│              │  └────────────────────────────────────┘  │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

---

# 48. IP RESULT LAYOUT

```text
┌─────────────────────────────────────────────────────┐
│ IP GEOLOCATION RESULT                               │
├──────────────────────┬──────────────────────────────┤
│ TARGET               │ MAP                          │
│                      │                              │
│ 8.8.8.8              │       ●                     │
│ IPv4                 │    Approximate               │
│                      │    Location                  │
├──────────────────────┴──────────────────────────────┤
│ LOCATION                                             │
│ Country | Region | City | Timezone                  │
├─────────────────────────────────────────────────────┤
│ NETWORK                                              │
│ ISP | ASN | Organization | Domain                   │
├─────────────────────────────────────────────────────┤
│ VERIFICATION                                         │
│ Provider A ✓   Provider B ✓   Provider C ~          │
│                                                     │
│ Provider Consistency: HIGH                          │
└─────────────────────────────────────────────────────┘
```

---

# 49. FUTURE ROADMAP

Display in About page:

```text
v1.0
✓ IP Geolocation
✓ Public IP
✓ Network Intelligence
✓ Phone Metadata
✓ Username Enumeration
✓ History

v2.0
○ Consent-Based Browser Geolocation
○ Real-time location visualization
○ Advanced network analysis

v3.0
○ Additional intelligence providers
○ Advanced reporting
○ PDF reports
○ Team workspace
```

Do not implement future features unless requested.

---

# 50. README

Generate a professional README with:

```text
# BlackEye

Security Testing & Network Intelligence

## Features

## Architecture

## Tech Stack

## Installation

## Environment Variables

## Running Locally

## API Configuration

## Testing

## Screenshots

## Accuracy Limitations

## Privacy

## Authorized Use

## Roadmap
```

Include commands for:

```bash
git clone
cd BlackEye
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
npm run dev
```

Adapt commands to the final architecture.

---

# 51. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

Example:

```text
APP_ENV=development

DATABASE_URL=sqlite:///blackeye.db

PROVIDER_A_API_KEY=
PROVIDER_B_API_KEY=
PROVIDER_C_API_KEY=

RATE_LIMIT_PER_MINUTE=60

CACHE_TTL_SECONDS=3600
```

Never commit `.env`.

Add:

```text
.env
```

to `.gitignore`.

---

# 52. DO NOT CREATE FAKE DATA

This is critical.

Do not hard-code fake:

- IP locations
- ISP names
- ASNs
- accuracy values
- provider responses
- statistics

If API data is unavailable:

```text
Not available
```

If providers disagree:

```text
Provider disagreement
```

If an API isn't configured:

```text
Provider not configured
```

---

# 53. FINAL QUALITY REQUIREMENT

Before considering the project complete:

1. Run the backend.
2. Run the frontend.
3. Test every navigation item.
4. Test valid IP.
5. Test invalid IP.
6. Test private IP.
7. Test IPv6.
8. Test public IP detection.
9. Test phone metadata.
10. Test username enumeration.
11. Test provider failure.
12. Test empty states.
13. Test loading states.
14. Test mobile layout.
15. Test keyboard navigation.
16. Test dark theme.
17. Verify API keys are not exposed.
18. Verify no secrets are committed.
19. Verify animations don't break reduced-motion mode.
20. Verify there are no console errors.
21. Verify there are no backend errors.
22. Verify the README works.

---

# 54. FINAL DESIGN PRINCIPLE

The final BlackEye application should feel like:

**A professional SOC/security research dashboard**

NOT:

**A fake hacker website**

Use:

- clean information hierarchy
- subtle cyber aesthetics
- high-quality animations
- real data
- transparent limitations
- professional terminology
- responsive UI
- excellent error handling

The most important principle is:

```text
BLACK EYE

Observe.
Analyze.
Verify.

Never fabricate.
Never overclaim.
Always show the limitations of the data.
```

Build the complete working project, not merely a visual prototype.

If a dependency, API, or configuration is missing, implement the correct abstraction and provide a clear setup instruction rather than replacing it with fake data.

At the end, provide:

1. Complete project structure.
2. All source files.
3. Installation commands.
4. Environment configuration.
5. API setup instructions.
6. Database setup.
7. Development commands.
8. Production build commands.
9. Testing commands.
10. README.
11. Explanation of every major component.
12. List of any API keys or external services required.