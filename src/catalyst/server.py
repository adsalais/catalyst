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

        # ── Complex nested JSON blob #1: profile / preferences / history
        profile = {
            "identity": {
                "full_name": f"{first} {last}",
                "handle": f"@{first.lower()}_{last.lower()}",
                "aliases": random.sample(
                    [
                        "Starlord",
                        "Quantum-7",
                        "Nebuloid",
                        "Voidborn",
                        "Ion-Rider",
                        "Pulsewave",
                        "Cryo-Nomad",
                        "Astro-Ghost",
                    ],
                    k=random.randint(1, 3),
                ),
                "clearance_level": random.choice(["alpha", "beta", "gamma", "omega"]),
                "biometrics": {
                    "iris_scan_id": f"IRIS-{random.randint(100000, 999999)}",
                    "dna_hash": "".join(random.choices("0123456789abcdef", k=16)),
                    "reaction_time_ms": random.randint(120, 450),
                    "vitals": {
                        "heart_rate_bpm": random.randint(55, 95),
                        "o2_saturation": round(random.uniform(0.92, 0.99), 3),
                        "stress_index": round(random.uniform(0.0, 1.0), 2),
                    },
                },
            },
            "preferences": {
                "locale": random.choice(
                    ["en-US", "en-GB", "fr-FR", "ja-JP", "xx-SOL", "zz-MARS"]
                ),
                "timezone": random.choice(
                    ["UTC", "Europa/Ganymede", "Mars/Olympus", "Sol/Terra"]
                ),
                "notifications": {
                    "email": random.choice([True, False]),
                    "push": random.choice([True, False]),
                    "sms": False,
                    "quiet_hours": {
                        "enabled": random.choice([True, False]),
                        "from": f"{random.randint(20, 23):02d}:00",
                        "to": f"{random.randint(5, 8):02d}:00",
                    },
                },
                "ui": {
                    "theme": random.choice(["dark", "light", "nebula", "retro-crt"]),
                    "density": random.choice(["compact", "cozy", "roomy"]),
                    "feature_flags": random.sample(
                        [
                            "beta-warpdrive",
                            "alpha-ai-copilot",
                            "experimental-hologram",
                            "new-billing",
                            "legacy-terminal",
                            "quantum-search",
                        ],
                        k=random.randint(2, 5),
                    ),
                },
            },
            "history": [
                {
                    "event": random.choice(
                        [
                            "account_created",
                            "plan_upgraded",
                            "2fa_enabled",
                            "device_added",
                            "support_ticket_closed",
                            "contract_renewed",
                        ]
                    ),
                    "timestamp": f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}T{random.randint(0, 23):02d}:{random.randint(0, 59):02d}:00Z",
                    "source": random.choice(["web", "mobile", "api", "cli", "bot"]),
                    "metadata": {
                        "ip": f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}",
                        "agent": random.choice(
                            [
                                "StellarBrowser/4.2",
                                "NovaCLI/1.9",
                                "MoonMobile/3.0",
                                "AstroBot/2.1",
                            ]
                        ),
                    },
                }
                for _ in range(random.randint(2, 5))
            ],
            "tags": random.sample(
                [
                    "premium",
                    "early-adopter",
                    "beta-tester",
                    "newsletter",
                    "referred",
                    "loyal",
                    "at-risk",
                    "champion",
                ],
                k=random.randint(2, 5),
            ),
        }

        # ── Complex nested JSON blob #2: account metrics / billing / orgs
        metrics = {
            "summary": {
                "account_id": f"ACC-{10000 + i}",
                "health_score": round(random.uniform(0.0, 1.0), 2),
                "risk_flags": random.sample(
                    [
                        "churn-probable",
                        "payment-pending",
                        "quota-warning",
                        "security-review",
                        "legal-hold",
                    ],
                    k=random.randint(0, 3),
                ),
                "lifetime_value_usd": round(random.uniform(5000, 2_500_000), 2),
                "tenure_days": random.randint(30, 3650),
            },
            "billing": {
                "plan": random.choice(
                    ["free", "basic", "pro", "enterprise", "galactic"]
                ),
                "currency": random.choice(["USD", "EUR", "GBP", "SOL"]),
                "next_invoice_date": f"2026-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                "payment_methods": [
                    {
                        "type": random.choice(
                            ["credit-card", "bank-transfer", "crypto", "invoice"]
                        ),
                        "brand": random.choice(
                            ["Visa", "Mastercard", "Amex", "GalactiPay"]
                        ),
                        "last4": f"{random.randint(0, 9999):04d}",
                        "expires": f"{random.randint(1, 12):02d}/{random.randint(26, 35)}",
                        "default": j == 0,
                    }
                    for j in range(random.randint(1, 3))
                ],
                "invoices": [
                    {
                        "id": f"INV-{random.randint(100000, 999999)}",
                        "amount": round(random.uniform(50, 25000), 2),
                        "status": random.choice(
                            ["paid", "open", "void", "uncollectible"]
                        ),
                        "issued": f"2025-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
                        "line_items": [
                            {
                                "sku": random.choice(
                                    [
                                        "SEAT-PRO",
                                        "ADDON-AI",
                                        "STORAGE-TB",
                                        "SUPPORT-24x7",
                                        "TRAINING",
                                    ]
                                ),
                                "qty": random.randint(1, 50),
                                "unit_price": round(random.uniform(5, 500), 2),
                            }
                            for _ in range(random.randint(1, 4))
                        ],
                    }
                    for _ in range(random.randint(1, 3))
                ],
            },
            "organizations": [
                {
                    "org_id": f"ORG-{random.randint(1000, 9999)}",
                    "name": random.choice(CONTACT_COMPANIES),
                    "role": random.choice(
                        ["owner", "admin", "member", "viewer", "billing"]
                    ),
                    "seats": random.randint(1, 500),
                    "projects": [
                        {
                            "id": f"PRJ-{random.randint(100, 999)}",
                            "name": random.choice(
                                [
                                    "Andromeda",
                                    "Eclipse",
                                    "Nebulon-9",
                                    "Pulsar-Net",
                                    "Orion-Shield",
                                    "Tachyon-Lab",
                                ]
                            ),
                            "status": random.choice(
                                ["active", "paused", "archived", "planning"]
                            ),
                            "progress": round(random.uniform(0.0, 1.0), 2),
                            "contributors": random.randint(1, 40),
                        }
                        for _ in range(random.randint(1, 3))
                    ],
                }
                for _ in range(random.randint(1, 2))
            ],
            "usage": {
                "last_30d": {
                    "api_calls": random.randint(0, 500_000),
                    "bandwidth_gb": round(random.uniform(0, 2500), 2),
                    "compute_hours": round(random.uniform(0, 1000), 1),
                    "storage_gb": round(random.uniform(0, 10_000), 2),
                },
                "trend": [round(random.uniform(0.2, 1.5), 2) for _ in range(7)],
            },
        }

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
            "profile": profile,
            "metrics": metrics,
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
                {
                    "key": "profile",
                    "label": "Profile",
                    "width": 10,
                    "growth": 0,
                    "datatype": "json",
                    "expand": True,
                },
                {
                    "key": "metrics",
                    "label": "Metrics",
                    "width": 10,
                    "growth": 0,
                    "datatype": "json",
                    "expand": True,
                },
            ],
        }
    )
