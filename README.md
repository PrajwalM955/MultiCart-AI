# MultiCart AI SDK prototype

An e-commerce storefront demonstrating an embeddable multimodal shopping assistant. It uses DummyJSON for catalogue data, FastAPI for recommendation orchestration, and browser `localStorage` to keep category preferences private to the shopper's browser.

## Run it locally

Open two terminals from this repository:

```powershell
# terminal 1 — API
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python -m uvicorn main:app --app-dir backend --reload

# terminal 2 — storefront
npm.cmd install
npm.cmd run dev
```

Then open the Vite URL (normally `http://localhost:5173`). The frontend proxies `/api` to FastAPI during development.

## What the prototype demonstrates

- A responsive catalogue sourced from DummyJSON Products.
- A fixed, embeddable-style React chat widget with text, image and browser speech input (English India, Hindi India, Arabic Saudi Arabia).
- Rich horizontal product cards in assistant replies.
- Intent parsing for categories, colours and brands; follow-ups like **“only Nike”** retain previous category context.
- Local per-category preference weights from product clicks, included in each recommendation request to boost relevant categories.
- Lightweight simulated visual search based on uploaded image metadata. The `image-search` endpoint is intentionally isolated so a CLIP/vector-search implementation can replace its intent seeding without changing the widget API.

## Architecture

```text
React storefront + ChatWidget ── /api ──> FastAPI recommendation service ──> DummyJSON
             │                          ↑
             └── localStorage preferences┘
```
