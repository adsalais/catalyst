"""Catalyst package - FastAPI static file server."""

import uvicorn


def main() -> None:
    """Entry point to run the FastAPI server."""
    uvicorn.run(
        "catalyst.server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
