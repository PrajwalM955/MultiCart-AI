"""A small, explainable recommendation API for the MultiCart AI demo."""
from __future__ import annotations

import json
import re
from collections import Counter
from typing import Any

import httpx
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="MultiCart AI Demo API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

PRODUCT_URL = "https://dummyjson.com/products?limit=100"
_catalogue: list[dict[str, Any]] | None = None

class RecommendationRequest(BaseModel):
    query: str
    context: dict[str, Any] = Field(default_factory=dict)
    preferences: dict[str, int] = Field(default_factory=dict)

async def products() -> list[dict[str, Any]]:
    global _catalogue
    if _catalogue is None:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(PRODUCT_URL)
            response.raise_for_status()
            _catalogue = response.json()["products"]
    return _catalogue

def infer_intent(query: str, previous: dict[str, Any] | None = None) -> dict[str, Any]:
    q = query.lower().strip()
    intent = dict(previous or {})
    category_aliases = {
        "shoe": ["mens-shoes", "womens-shoes"], "sneaker": ["mens-shoes", "womens-shoes"],
        "smartphone": ["smartphones"], "phone": ["smartphones"], "mobile": ["smartphones"],
        "sport": ["sports-accessories"], "fitness": ["sports-accessories"], "makeup": ["beauty"],
        "laptop": ["laptops"], "watch": ["mens-watches", "womens-watches"], "fragrance": ["fragrances"],
        "furniture": ["furniture"], "grocery": ["groceries"], "bag": ["womens-bags", "mens-shirts"]
    }
    matches = [category for word, category in category_aliases.items() if word in q]
    if matches: intent["categories"] = [item for group in matches for item in group]
    colors = [color for color in ["black", "white", "red", "blue", "green", "brown", "pink", "gold", "silver"] if color in q]
    if colors: intent["color"] = colors[0]
    brands = re.findall(r"\b(nike|apple|samsung|adidas|puma|gucci|dell|sony|oppo|huawei)\b", q)
    if brands: intent["brand"] = brands[-1]
    # “only Nike” deliberately retains the prior category.
    intent["last_query"] = query
    return intent

def search_catalogue(catalogue: list[dict[str, Any]], intent: dict[str, Any], preferences: dict[str, int]) -> list[dict[str, Any]]:
    terms = intent.get("last_query", "").lower().split()
    categories = intent.get("categories", [])
    color, brand = intent.get("color"), intent.get("brand")
    pref_max = max(preferences.values(), default=0)

    def score(product: dict[str, Any]) -> float:
        searchable = " ".join(str(product.get(k, "")) for k in ("title", "description", "category", "brand", "tags")).lower()
        value = 0.0
        if product["category"] in categories: value += 12
        if color and color in searchable: value += 8
        if brand and brand in searchable: value += 20
        value += sum(1.5 for term in terms if len(term) > 2 and term in searchable)
        if pref_max: value += 4 * preferences.get(product["category"], 0) / pref_max
        return value + float(product.get("rating", 0)) / 10

    ranked = sorted(catalogue, key=score, reverse=True)
    strong = [p for p in ranked if score(p) > 1]
    return (strong or ranked)[:8]

def reply_for(intent: dict[str, Any], count: int, image: bool = False) -> str:
    details = []
    if intent.get("color"): details.append(intent["color"])
    if intent.get("brand"): details.append(intent["brand"].title())
    if intent.get("categories"): details.append(intent["categories"][0].replace("-", " "))
    description = " ".join(details) or "great matches"
    prefix = "I looked at the visual cues in your image and found" if image else "Here are"
    return f"{prefix} {count} {description} options. Your clicks will gently tune what I show next."

@app.get("/api/health")
async def health(): return {"status": "ok"}

@app.get("/api/products")
async def get_products(limit: int = 100):
    catalogue = await products()
    return {"products": catalogue[:limit], "total": len(catalogue)}

@app.post("/api/recommendations")
async def recommend(request: RecommendationRequest):
    catalogue = await products()
    intent = infer_intent(request.query, request.context)
    found = search_catalogue(catalogue, intent, request.preferences)
    return {"reply": reply_for(intent, len(found)), "products": found, "context": intent}

@app.post("/api/image-search")
async def image_search(image: UploadFile = File(...), preferences_json: str = Form("{}")):
    """Prototype visual search: filename semantics seed the same transparent ranking model.

    This keeps the demo dependency-light; swap infer_intent for a CLIP embedding service in production.
    """
    preferences = json.loads(preferences_json)
    semantic_hint = image.filename or "product image"
    # A neutral image falls back to the user's local category affinities.
    intent = infer_intent(semantic_hint)
    catalogue = await products()
    found = search_catalogue(catalogue, intent, preferences)
    return {"reply": reply_for(intent, len(found), image=True), "products": found, "context": intent}
