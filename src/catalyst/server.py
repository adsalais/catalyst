"""FastAPI server that serves static HTML files."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Resolve paths relative to the project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = PROJECT_ROOT / "static"

app = FastAPI(title="Catalyst Static Server")


@app.get("/")
async def serve_index():
    """Serve the index.html file on the root route."""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"error": "index.html not found in static directory"}


# Mount the static directory to serve all static assets
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
