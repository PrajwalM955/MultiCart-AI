"""A small, explainable recommendation API for the MultiCart AI demo."""
from __future__ import annotations

import json
import re
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
    category_aliases = {
        "shoe": ["mens-shoes", "womens-shoes"], "sneaker": ["mens-shoes", "womens-shoes"],
        "smartphone": ["smartphones"], "phone": ["smartphones"], "mobile": ["smartphones"],
        "sport": ["sports-accessories"], "fitness": ["sports-accessories"], "makeup": ["beauty"],
        "beauty": ["beauty"], "perfume": ["fragrances"], "perfumes": ["fragrances"],
        "laptop": ["laptops"], "watch": ["mens-watches", "womens-watches"], "fragrance": ["fragrances"],
        "furniture": ["furniture"], "grocery": ["groceries"], "bag": ["womens-bags", "mens-shirts"]
    }
    matches = [category for word, category in category_aliases.items() if word in q]
    follow_up = bool(re.search(r"\b(only|just|that|those|them|similar|more|another|cheaper)\b", q))
    # A named category begins a fresh request. Constraint-only follow-ups ("only Nike")
    # retain the category, colour and other useful context from the previous turn.
    intent = dict(previous or {}) if (follow_up or not matches) else {}
    if matches: intent["categories"] = [item for group in matches for item in group]
    colors = [color for color in ["black", "white", "red", "blue", "green", "brown", "pink", "gold", "silver"] if color in q]
    if colors: intent["color"] = colors[0]
    brands = re.findall(r"\b(nike|apple|samsung|adidas|puma|gucci|dell|sony|oppo|huawei)\b", q)
    if brands: intent["brand"] = brands[-1]
    intent["last_query"] = query
    return intent

def product_text(product: dict[str, Any]) -> str:
    return " ".join(str(product.get(key, "")) for key in ("title", "description", "category", "brand", "tags")).lower()

def search_catalogue(catalogue: list[dict[str, Any]], intent: dict[str, Any], preferences: dict[str, int]) -> tuple[list[dict[str, Any]], str]:
    terms = intent.get("last_query", "").lower().split()
    categories = intent.get("categories", [])
    color, brand = intent.get("color"), intent.get("brand")
    pref_max = max(preferences.values(), default=0)

    def score(product: dict[str, Any]) -> float:
        searchable = product_text(product)
        value = 0.0
        if product["category"] in categories: value += 12
        if color and color in searchable: value += 8
        if brand and brand in searchable: value += 20
        value += sum(1.5 for term in terms if len(term) > 2 and term in searchable)
        if pref_max: value += 4 * preferences.get(product["category"], 0) / pref_max
        return value + float(product.get("rating", 0)) / 10

    # Layer 1: all requested constraints have an exact product match.
    category_pool = [p for p in catalogue if not categories or p["category"] in categories]
    constrained = category_pool
    if color:
        constrained = [p for p in constrained if color in product_text(p)]
    if brand:
        constrained = [p for p in constrained if brand in product_text(p)]
    if constrained:
        return sorted(constrained, key=score, reverse=True)[:8], "exact"

    # Layer 2: keep the category request even when the catalogue has no exact
    # colour/brand variation (e.g. "only Nike" after shoes).
    if category_pool:
        return sorted(category_pool, key=score, reverse=True)[:8], "similar"

    # Layer 3: no known category: return high-rated, preference-boosted products.
    return sorted(catalogue, key=score, reverse=True)[:8], "trending"

def reply_for(intent: dict[str, Any], count: int, match_type: str, image: bool = False) -> str:
    details = []
    if intent.get("color"): details.append(intent["color"])
    if intent.get("brand"): details.append(intent["brand"].title())
    if intent.get("categories"): details.append(intent["categories"][0].replace("-", " "))
    description = " ".join(details) or "great matches"
    if image:
        return "Showing visually similar products."
    if match_type == "exact":
        return f"Here are {count} {description} options. Your clicks will gently tune what I show next."
    if match_type == "similar":
        return f"I couldn't find an exact {description} match in this catalogue, so I picked {count} similar options in the same department."
    return f"I couldn't find an exact match, so here are {count} trending options, lightly personalized from what you've clicked."

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
    found, match_type = search_catalogue(catalogue, intent, request.preferences)
    return {"reply": reply_for(intent, len(found), match_type), "products": found, "context": intent, "match_type": match_type}

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
    found, match_type = search_catalogue(catalogue, intent, preferences)
    return {"reply": reply_for(intent, len(found), match_type, image=True), "products": found, "context": intent, "match_type": match_type}
