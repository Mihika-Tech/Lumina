# Lumina: LLM Observability & Guardrails Platform

Lumina is a fault-tolerant, real-time observability system designed to monitor, evaluate, and safeguard Large Language Models (LLMs) in production. 

It acts as a middleware layer between the user and the LLM, providing semantic validation to prevent hallucinations and circuit breakers to ensure system reliability during high latency or failure states.

## 🚀 Key Features

* **Semantic Guardrails:** Uses `sentence-transformers` (Vector Embeddings) and Cosine Similarity to detect and block hallucinations or off-topic responses in real-time.
* **Circuit Breaker Pattern:** Protects the system from cascading failures by cutting off traffic to unresponsive upstream AI services.
* **Real-time Dashboard:** A React-based visualization layer tracking latency spikes, hallucination rates, and system health status.
* **Fault Tolerance:** Implements retry logic and fallback mechanisms (Safe Mode) to ensure 99.9% availability.

## 🛠️ Tech Stack

* **Backend:** FastAPI (Python), AsyncIO
* **Frontend:** React (Vite), Recharts, TailwindCSS
* **ML Engine:** Sentence-Transformers (`all-MiniLM-L6-v2`), Scikit-Learn
* **Infrastructure:** Docker, Docker Compose
* **LLM Integration:** Compatible with OpenAI GPT-4 and Ollama (Local Mistral/Llama3)

## ⚡ Quick Start

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/Lumina.git](https://github.com/YOUR_USERNAME/Lumina.git)
    cd Lumina
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file in the root directory:
    ```text
    OPENAI_API_KEY=your_api_key_here  # Optional if using Local Ollama
    ```

3.  **Run with Docker:**
    ```bash
    docker compose up --build
    ```

4.  **Access the Dashboard:**
    Open `http://localhost:5173` in your browser.

## 📂 Architecture

* **`backend/app/core/guardrail.py`**: The semantic evaluation engine.
* **`backend/app/core/circuit_breaker.py`**: The state-machine handling failure logic.
* **`frontend/src/App.jsx`**: The real-time visualization dashboard.

