"""FastAPI server that serves static HTML files."""

import random
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Resolve paths relative to the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = PROJECT_ROOT / "static"

app = FastAPI(title="Catalyst Static Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def serve_index():
    """Serve the index.html file on the root route."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"error": "index.html not found in static directory"}


# Mount the static directory to serve all static assets
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


CONTACT_FIRST_NAMES = [
    "Zara",
    "Orion",
    "Nova",
    "Cassius",
    "Lyra",
    "Kepler",
    "Astra",
    "Sol",
    "Elara",
    "Rigel",
    "Vega",
    "Altair",
    "Sirius",
    "Polaris",
    "Antares",
    "Betelgeuse",
    "Deneb",
    "Fomalhaut",
    "Aldebaran",
    "Regulus",
    "Spica",
    "Arcturus",
    "Castor",
    "Pollux",
    "Procyon",
    "Capella",
    "Ruchbah",
    "Mirach",
    "Alpheratz",
    "Caph",
    "Schedar",
    "Algol",
    "Mirfak",
    "Menkar",
    "Diphda",
    "Hamal",
    "Sheratan",
    "Mesarthim",
    "Algenib",
    "Markab",
    "Scheat",
    "Alpheratz",
    "Enif",
    "Homam",
    "Baham",
]

CONTACT_LAST_NAMES = [
    "Starweaver",
    "Voidwalker",
    "Nebulon",
    "Quark",
    "Stardust",
    "Singularity",
    "Cosmos",
    "Eventide",
    "Lightyear",
    "Warpdrive",
    "Tachyon",
    "Hyperion",
    "Andromeda",
    "Celestia",
    "Aether",
    "Ionstorm",
    "Darkmatter",
    "Pulsar",
    "Supernova",
    "Blackwell",
    "Redshift",
    "Blueshift",
    "Zenith",
    "Nadir",
    "Equinox",
    "Solstice",
    "Meridian",
    "Parallax",
    "Apex",
    "Vertex",
    "Quantum",
    "Flux",
    "Vector",
    "Matrix",
    "Cipher",
    "Helix",
    "Nexus",
    "Vortex",
    "Prism",
    "Orbital",
    "Lunar",
    "Solar",
]

CONTACT_COMPANIES = [
    "Stellar Dynamics",
    "Quantum Leap Inc.",
    "Nebula Networks",
    "Void Ventures",
    "Cosmic Cargo",
    "Astro Analytics",
    "Galaxy Gateways",
    "OrbitOps",
    "Deep Space Deliveries",
    "Planetary Pioneers",
    "Rocket Relay",
    "Satellite Syndicate",
    "Meteor Mail",
    "Comet Communications",
    "Asteroid Apps",
    "Interstellar Insights",
    "Warp Works",
    "Lunar Logistics",
    "Martian Manufacturing",
    "Titan Tech",
]

CONTACT_TAGS = [
    "VIP",
    "Lead",
    "Partner",
    "Investor",
    "Contractor",
    "Supplier",
    "Client",
    "Prospect",
    "Alumni",
    "Referral",
]


def _random_phone():
    """Generate a retro-futuristic comm-link number."""
    return f"+{random.randint(1, 99)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}-x{random.randint(10, 99)}"


def _random_email(first, last, company):
    """Generate a work email from name and company."""
    domain = company.lower().replace(" ", "").replace(".", "") + ".space"
    return f"{first.lower()}.{last.lower()}@{domain}"


@app.get("/api/contact")
def get_contacts(offset: int = 0, limit: int = 100):
    total_available = 5000

    rows = []
    for i in range(offset, min(offset + limit, total_available)):
        first = CONTACT_FIRST_NAMES[i % len(CONTACT_FIRST_NAMES)]
        last = CONTACT_LAST_NAMES[i % len(CONTACT_LAST_NAMES)]
        company = CONTACT_COMPANIES[i % len(CONTACT_COMPANIES)]
        tag = CONTACT_TAGS[i % len(CONTACT_TAGS)]

        # Vary the data so not every row looks identical
        is_vip = tag == "VIP"
        satisfaction = round(random.uniform(0.0, 1.0), 2)
        account_value = round(random.uniform(1000, 500000), 2)
        active_projects = random.randint(0, 12)
        response_time_min = random.randint(1, 120)

        row = {
            "id": i + 1,
            "name": f"{first} {last}",
            "email": _random_email(first, last, company),
            "phone": _random_phone(),
            "company": company,
            "tag": tag,
            "is_vip": is_vip,
            "satisfaction": satisfaction,
            "account_value": account_value,
            "active_projects": active_projects,
            "response_time": response_time_min,
            "last_contact": f"2026-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            "notes": f"Contact established during {random.choice(['Q1', 'Q2', 'Q3', 'Q4'])} outreach. "
            f"Primary interest: {random.choice(['Fusion drives history', 'Cryo-sleep pods', 'Gravity', 'AI cores', 'Shields in start treck beetwen 1960 and 2024'])}.",
        }
        rows.append(row)

    if offset >= total_available:
        rows = []

    return JSONResponse(
        content={
            "rows": rows,
            "headers": [
                {
                    "key": "name",
                    "label": "Name",
                    "width": 12,
                    "growth": 1,
                    "datatype": "text",
                },
                {
                    "key": "email",
                    "label": "Email",
                    "width": 14,
                    "growth": 2,
                    "hidden": True,
                    "datatype": "email",
                },
                {
                    "key": "phone",
                    "label": "Comm Link",
                    "width": 12,
                    "growth": 0,
                    "datatype": "phone",
                },
                {
                    "key": "company",
                    "label": "Organization",
                    "width": 12,
                    "growth": 1,
                    "datatype": "text",
                },
                {
                    "key": "tag",
                    "label": "Tag",
                    "width": 8,
                    "growth": 0,
                    "datatype": "status",
                },
                {
                    "key": "is_vip",
                    "label": "VIP",
                    "width": 4,
                    "growth": 0,
                    "datatype": "boolean",
                },
                {
                    "key": "satisfaction",
                    "label": "Satisfaction",
                    "width": 6,
                    "growth": 0,
                    "datatype": "percent",
                },
                {
                    "key": "account_value",
                    "label": "Account Value",
                    "width": 8,
                    "growth": 0,
                    "datatype": "currency",
                },
                {
                    "key": "active_projects",
                    "label": "Projects",
                    "width": 5,
                    "growth": 0,
                    "datatype": "number",
                },
                {
                    "key": "response_time",
                    "label": "Response (min)",
                    "width": 6,
                    "growth": 0,
                    "datatype": "number",
                },
                {
                    "key": "last_contact",
                    "label": "Last Contact",
                    "width": 8,
                    "growth": 0,
                    "datatype": "date",
                },
                {
                    "key": "notes",
                    "label": "Notes",
                    "width": 20,
                    "growth": 3,
                    "datatype": "text",
                },
            ],
        }
    )
