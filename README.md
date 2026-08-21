# Travelverse AI

Travelverse AI is a next-generation travel orchestration platform featuring an AI Copilot, SmartBundle packaging, RAG-powered local recommendations, and real-time disruption monitoring.

## Prerequisites

- **Docker** and **Docker Compose** installed.
- (Optional) API Keys for Gemini, Google Maps, TBO Holidays, and OpenWeatherMap if you intend to run in live mode.

## 🚀 Quick Start (Local Development)

The easiest way to get the entire stack (Frontend, Backend, PostgreSQL, Redis) running is via Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aaravgorewal/Travelverse-AI.git
   cd Travelverse-AI
   ```

2. **Configure your environment**:
   Copy the example environment file and open it.
   ```bash
   cp .env.example .env
   ```
   > **Note**: By default, `.env.example` sets `MOCK_MODE=true`. This allows you to run the entire application completely offline without needing paid API keys.

3. **Start the application**:
   Run the following single command to build and launch all services:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - **Frontend**: http://localhost:5173
   - **Backend API Docs**: http://localhost:8000/docs

## 🗄️ Database Setup & Migrations

The database schema is managed via Alembic. When starting the application for the first time, you must run the migrations.

With the containers running, execute:
```bash
docker-compose exec backend alembic upgrade head
```

## 🧠 Dataset Ingestion (RAG Setup)

Travelverse utilizes Retrieval-Augmented Generation (RAG) for personalized recommendations (LocalSense) and Agent Copilot knowledge.

To seed the vector database with destination data and customer preferences:
```bash
docker-compose exec backend python scripts/ingest_datasets.py
```

## 🔧 Advanced Configuration

If you wish to test the live integration of the AI Orchestrator, disable mock mode and supply your provider keys in `.env`:

```env
MOCK_MODE=false
GEMINI_API_KEY="your_google_ai_key"
GOOGLE_MAPS_API_KEY="your_google_maps_key"
TBO_API_KEY="your_tbo_holidays_key"
WEATHER_API_KEY="your_openweather_key"
```

## 🧪 Testing

### Backend Unit Tests
To run the strict Python test suite (including failure/chaos resilience):
```bash
docker-compose exec backend pytest
```

### End-to-End Tests
To run the full Playwright traveler and agent journeys against the running instance:
```bash
npx playwright test
```
