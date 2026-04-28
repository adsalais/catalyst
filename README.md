# Catalyst

A simple FastAPI server that serves static HTML files.

## Prerequisites

- Python >= 3.12
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

## Installation

### Using uv (recommended)

```bash
uv sync
```

### Using pip

```bash
pip install fastapi uvicorn
```

## Running the Server

### Option 1: Using the project script

```bash
uv run catalyst
```

Or with pip:

```bash
python -m catalyst
```

### Option 2: Using uvicorn directly

```bash
uv run uvicorn catalyst.server:app --reload --host 127.0.0.1 --port 8000
```

## Usage

Once the server is running, open your browser and navigate to:

- **Static HTML page**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Static assets**: [http://127.0.0.1:8000/static/](http://127.0.0.1:8000/static/)

## Project Structure

```
catalyst/
├── pyproject.toml
├── README.md
├── static/
│   └── index.html      # Static HTML file served on /
└── src/
    └── catalyst/
        ├── __init__.py  # Entry point (main)
        └── server.py    # FastAPI application
```

## Adding More Static Files

Place any HTML, CSS, JS, or image files in the `static/` directory. They will be accessible under the `/static/` route. For example, `static/js/app.js` is available at `http://127.0.0.1:8000/static/js/app.js`.