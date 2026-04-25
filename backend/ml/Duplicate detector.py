"""
duplicate_detector.py
─────────────────────
Cosine-similarity duplicate detection for Complaint Setu.
Plugs into the existing FastAPI/Flask ML backend alongside
the existing /predict (priority) endpoint.

Strategy
────────
  1. Enrich each complaint by concatenating  category + location + details.
     This makes "Water Issues Sector 12 no supply" very different from
     "Electricity Vijay Nagar power cut", even if raw text overlaps.
  2. Vectorise with TF-IDF (unigrams + bigrams, English stopwords removed).
  3. Compute cosine similarity between the new complaint and every open
     complaint fetched from MongoDB.
  4. Return any matches above THRESHOLD, sorted by score descending.

Thresholds (tuned on civic complaint language):
  ≥ 0.55  → almost certainly a duplicate
  0.30–0.54 → likely related / possible duplicate
  < 0.30  → different complaint
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

# ── Configurable thresholds ───────────────────────────────────────────────────
THRESHOLD_HIGH   = 0.55   # "Definite duplicate" label
THRESHOLD_MEDIUM = 0.30   # "Possible duplicate" label


# ── Text normalisation ────────────────────────────────────────────────────────
def _preprocess(details: str, category: str = "", location: str = "") -> str:
    """
    Concatenate fields and normalise to lowercase ASCII.
    Weighting strategy: location repeated twice so nearby complaints
    cluster more tightly than identical text in different wards.
    """
    combined = f"{category} {location} {location} {details}"
    combined = combined.lower()
    combined = re.sub(r"[^a-z0-9\s]", " ", combined)   # strip punctuation
    combined = re.sub(r"\s+", " ", combined).strip()     # collapse whitespace
    return combined


# ── Core detector ─────────────────────────────────────────────────────────────
def find_duplicates(
    new_details:  str,
    new_category: str,
    new_location: str,
    existing_complaints: List[Dict[str, Any]],
    threshold: float = THRESHOLD_MEDIUM,
    top_k: int = 3,
) -> List[Dict[str, Any]]:
    """
    Parameters
    ──────────
    new_details          : raw description of the incoming complaint
    new_category         : e.g. "Water Issues"
    new_location         : e.g. "Sector 12, Indore"
    existing_complaints  : list of dicts fetched from MongoDB —
                           each must have keys: _id, category, location,
                           details, status, upvotes (upvotes optional)
    threshold            : minimum cosine similarity to report (default 0.30)
    top_k                : max matches to return

    Returns
    ───────
    List of matching complaint dicts, each augmented with:
      - similarity  (float 0–1)
      - match_level ("definite" | "possible")
    Sorted by similarity descending. Empty list = no duplicates found.
    """
    if not existing_complaints:
        return []

    # Build corpus: existing first, new complaint last
    existing_docs = [
        _preprocess(c.get("details", ""), c.get("category", ""), c.get("location", ""))
        for c in existing_complaints
    ]
    new_doc = _preprocess(new_details, new_category, new_location)

    corpus = existing_docs + [new_doc]

    # Fit TF-IDF on the whole corpus (so IDF is stable)
    vectoriser = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),      # unigrams + bigrams
        min_df=1,
        sublinear_tf=True,       # log(1+tf) dampens high-freq terms
        max_features=10_000,
    )
    try:
        tfidf_matrix = vectoriser.fit_transform(corpus)
    except ValueError:
        # Edge case: all documents are empty after preprocessing
        return []

    new_vec      = tfidf_matrix[-1]        # last row = new complaint
    existing_mat = tfidf_matrix[:-1]       # all other rows

    scores = cosine_similarity(new_vec, existing_mat)[0]   # shape (n,)

    # Collect matches above threshold
    matches = []
    for idx in np.argsort(scores)[::-1]:      # descending order
        score = float(scores[idx])
        if score < threshold:
            break                              # argsorted so rest are lower
        if len(matches) >= top_k:
            break

        complaint = dict(existing_complaints[idx])   # shallow copy
        complaint["similarity"]  = round(score, 4)
        complaint["match_level"] = (
            "definite" if score >= THRESHOLD_HIGH else "possible"
        )
        matches.append(complaint)

    return matches


# ── Quick self-test (run: python duplicate_detector.py) ──────────────────────
if __name__ == "__main__":
    sample_db = [
        {
            "_id": "c001",
            "category": "Water Issues",
            "location": "Sector 12",
            "details": "No water supply since 3 days in my colony",
            "status": "Pending",
            "upvotes": 5,
        },
        {
            "_id": "c002",
            "category": "Roads & Potholes",
            "location": "MG Road",
            "details": "Large pothole near bus stop causing accidents",
            "status": "In Progress",
            "upvotes": 2,
        },
        {
            "_id": "c003",
            "category": "Electricity",
            "location": "Vijay Nagar",
            "details": "Power cut for 6 hours daily in our area",
            "status": "Pending",
            "upvotes": 8,
        },
    ]

    test_cases = [
        ("water supply problem in sector 12 area for past 2 days", "Water Issues",      "Sector 12"),
        ("pothole on mg road near bus stand",                       "Roads & Potholes", "MG Road"),
        ("stray dogs menace near school",                           "Sanitation",        "Palasia"),
    ]

    for details, cat, loc in test_cases:
        result = find_duplicates(details, cat, loc, sample_db)
        print(f'\nQuery : "{details[:55]}"')
        if result:
            for r in result:
                print(f'  [{r["match_level"].upper():8}] {r["similarity"]:.4f} → {r["details"][:50]}')
        else:
            print("  No duplicates found")