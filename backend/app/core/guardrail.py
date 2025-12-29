from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Loading the model once
model = SentenceTransformer('all-MiniLM-L6-v2')

class Guardrail:
    def __init__(self, threshold = 0.3):
        self.threshold = threshold

    def evaluate(self, generated_text: str, context: str):
        """
        Compares the AI's output against the provided context
        to check for relevance/hallucination
        """
        # Encoding both texts into vector embeddings
        embeddings = model.encode([generated_text, context])

        # Calculate cosine similarity
        score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

        status = "HEALTHY" if score > self.threshold else "HALLUCINATION"

        return {
            "score": float(score),
            "status": status,
            "generated_text": generated_text
        }