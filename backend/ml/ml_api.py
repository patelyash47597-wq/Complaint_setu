# ml_api.py — PURI FILE replace kar is se

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional
import joblib, numpy as np, io
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# ml_api.py — top mein, app create karne ke BAAD ye add karo

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app):
    # Server start hote hi MobileNetV2 load ho jayega
    print("Loading MobileNetV2 at startup...")
    get_img_model()   # ← teri existing function
    print("✅ Ready to accept requests")
    yield

# App mein lifespan pass karo
app = FastAPI(lifespan=lifespan)

# ── CORS add karo (React se call ke liye) ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model      = joblib.load(BASE_DIR / "priority_model.pkl")
vectorizer = joblib.load(BASE_DIR / "vectorizer.pkl")

# ── MobileNetV2 lazy load (pehli call pe load hoga, ~3 sec) ──────────────────
_img_model = None
def get_img_model():
    global _img_model
    if _img_model is None:
        from tensorflow.keras.applications import MobileNetV2
        _img_model = MobileNetV2(
            weights="imagenet", include_top=False, pooling="avg"
        )
        print("✅ MobileNetV2 loaded")
    return _img_model

def extract_img_features(img_bytes: bytes) -> np.ndarray:
    """Image bytes → (1, 1280) feature vector"""
    try:
        from tensorflow.keras.preprocessing import image as kimage
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
        from PIL import Image
        pil = Image.open(io.BytesIO(img_bytes)).convert("RGB").resize((224, 224))
        x   = np.expand_dims(kimage.img_to_array(pil), axis=0)
        return get_img_model().predict(preprocess_input(x), verbose=0)
    except Exception as e:
        print(f"Image error: {e}")
        return np.zeros((1, 1280), dtype=np.float32)

def get_severity(features: np.ndarray) -> float:
    """Feature vector → 0.0 (safe) to 1.0 (severe) score"""
    vec  = features.flatten()
    topk = np.sort(vec)[-(len(vec) // 5):]
    return round(float(np.mean(topk) / (np.max(vec) + 1e-8)), 4)


# ── POST /predict — UPDATED: ab multipart form accept karta hai ───────────────
@app.post("/predict")
async def predict(
    text:     str                  = Form(...),
    category: str                  = Form(default=""),
    location: str                  = Form(default=""),
    file:     Optional[UploadFile] = File(default=None)   # ← image optional
):
    # 1. Text vector (tera existing vectorizer)
    enriched = f"{category} {location} {text}".strip()
    X        = vectorizer.transform([enriched])

    # 2. Base prediction from text model
    priority   = model.predict(X)[0]
    confidence = float(model.predict_proba(X).max())

    # 3. Image override (agar photo upload hua hai)
    image_used   = False
    image_severity = None

    if file is not None:
        img_bytes      = await file.read()
        img_features   = extract_img_features(img_bytes)
        image_severity = get_severity(img_features)
        image_used     = True

        # Rule-based override — text model ko image se correct karo
        if image_severity >= 0.75 and priority != "High":
            priority   = "High"
            confidence = max(confidence, 0.72)
        elif image_severity >= 0.45 and priority == "Low":
            priority   = "Medium"
            confidence = max(confidence, 0.62)

    return {
        "priority":        priority,
        "confidence":      round(confidence, 4),
        "confidence_pct":  f"{confidence * 100:.1f}%",
        "image_used":      image_used,
        "image_severity":  image_severity,
    }


# ── POST /find-duplicates — SAME RAKHA, KUCH NAHI BADLA ─────────────────────
@app.post("/find-duplicates")
def find_duplicates(data: dict):
    incoming_text     = data["text"]
    incoming_location = data.get("location", "").lower()
    candidates        = data.get("candidates", [])
    threshold         = data.get("threshold", 0.55)

    if not candidates or not incoming_text.strip():
        return {"duplicates": []}

    corpus       = [incoming_text] + [c["text"] for c in candidates]
    tfidf_matrix = vectorizer.transform(corpus)
    sims         = cosine_similarity(
        tfidf_matrix[0:1], tfidf_matrix[1:]
    ).flatten()

    duplicates = []
    for sim, candidate in zip(sims, candidates):
        if sim < threshold:
            continue
        cand_loc       = candidate.get("location", "").lower()
        loc_words_in   = set(incoming_location.split())
        loc_words_cand = set(cand_loc.split())
        if not (loc_words_in & loc_words_cand):
            continue
        duplicates.append({
            "id":         candidate["id"],
            "text":       candidate["text"],
            "location":   candidate["location"],
            "upvotes":    candidate.get("upvotes", 0),
            "similarity": round(float(sim), 3),
        })

    duplicates.sort(key=lambda x: x["similarity"], reverse=True)
    return {"duplicates": duplicates[:5]}