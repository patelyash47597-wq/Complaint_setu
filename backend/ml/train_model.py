import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB   # ✅ changed

# Load your CSV
current_dir = os.path.dirname(__file__)
file_path = os.path.join(current_dir, "complaint.csv")
df = pd.read_csv(file_path)

# Use only text and priority
X = df["text"]
y = df["priority"]

# Convert text → numbers
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2)

# Train model (Naive Bayes)
model = MultinomialNB()   # ✅ changed
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "priority_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model trained and saved")