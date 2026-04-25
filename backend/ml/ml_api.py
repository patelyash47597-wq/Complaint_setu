from fastapi import FastAPI
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import numpy as np

app = FastAPI()

model = joblib.load("priority_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

@app.post("/predict")
def predict(data: dict):
    text = data["text"]

    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]

    return {
        "priority": prediction
    }

@app.post("/find-duplicates")
def find_duplicates(data: dict):
    """
    data = {
        "text": <new complaint details>,
        "location": <ward / area string>,
        "candidates": [
            { "id": "...", "text": "...", "location": "...", "upvotes": 0 },
            ...
        ],
        "threshold": 0.55   # optional, default 0.55
    }
    Returns candidates whose cosine similarity to `text` exceeds the threshold
    AND whose location fuzzy-matches the incoming location.
    """
    incoming_text = data["text"]
    incoming_location = data.get("location", "").lower()
    candidates = data.get("candidates", [])
    threshold = data.get("threshold", 0.55)

    if not candidates or not incoming_text.strip():
        return {"duplicates": []}

    # Build corpus: [incoming] + [all candidate texts]
    corpus = [incoming_text] + [c["text"] for c in candidates]
    tfidf_matrix = vectorizer.transform(corpus)

    # Similarity of incoming (row 0) against every candidate (rows 1..N)
    sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    duplicates = []
    for idx, (sim, candidate) in enumerate(zip(sims, candidates)):
        if sim < threshold:
            continue

        # Loose location match — at least one word overlap (handles partial ward names)
        cand_location = candidate.get("location", "").lower()
        loc_words_in = set(incoming_location.split())
        loc_words_cand = set(cand_location.split())
        location_match = bool(loc_words_in & loc_words_cand)

        if not location_match:
            continue

        duplicates.append({
            "id": candidate["id"],
            "text": candidate["text"],
            "location": candidate["location"],
            "upvotes": candidate.get("upvotes", 0),
            "similarity": round(float(sim), 3),
        })

    # Sort by similarity descending
    duplicates.sort(key=lambda x: x["similarity"], reverse=True)
    return {"duplicates": duplicates[:5]}  # cap at 5 suggestions