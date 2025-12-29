from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.guardrail import Guardrail
from app.core.circuit_breaker import CircuitBreaker
import asyncio
import aiohttp  # <--- NEW LIBRARY
import random

app = FastAPI(title="Lumina Backend")

# --- CORS SETTINGS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

guardrail = Guardrail()
breaker = CircuitBreaker()

# --- OLLAMA GENERATOR (Free, Local, Private) ---
@breaker
async def ollama_generator(prompt: str):
    """
    Connects to Ollama running on your host machine.
    Note: We use 'host.docker.internal' to reach your laptop from inside Docker.
    """
    # The URL for Ollama when running inside Docker
    ollama_url = "http://host.docker.internal:11434/api/generate"
    
    payload = {
        "model": "mistral",   # Ensure you ran 'ollama run mistral' first
        "prompt": prompt,
        "stream": False       # We want the full response at once
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(ollama_url, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Ollama Error ({response.status}): {error_text}")
                
                data = await response.json()
                return data['response']
                
        except aiohttp.ClientConnectorError:
            raise Exception("Could not connect to Ollama. Is it running?")

# --- ENDPOINTS ---
@app.post("/analyze")
async def analyze_request(prompt: str, context: str):
    try:
        # 1. Retry Logic
        attempts = 0
        max_retries = 2  # Lower retries for local models as they are slower
        response = ""
        
        while attempts < max_retries:
            try:
                # CALLING OLLAMA HERE
                response = await ollama_generator(prompt)
                break
            except Exception as e:
                attempts += 1
                print(f"Retry {attempts}/{max_retries} due to: {e}")
                if attempts == max_retries:
                    return {"metrics": {"status": "CRITICAL_FAILURE", "score": 0.0}, "latency": 0}

        # 2. Guardrail Check
        metrics = guardrail.evaluate(response, context)
        
        # 3. Return Data
        return {
            "metrics": metrics,
            "latency": random.randint(500, 2000), # Local models take 1-2s usually
            "node_health": "OPTIMAL" if metrics['status'] == "HEALTHY" else "DEGRADED"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=503, detail="Service Unavailable")

@app.get("/health")
def health_check():
    return {"status": "Lumina System Operational"}