# Testing Guide

The backend uses `pytest` and `httpx` for unit and integration testing.

## Running Tests
To execute the entire test suite, ensure your virtual environment is active and run:
```bash
cd backend
pytest tests/ -v
```

## Key Test Suites

1. **`test_hallucinations.py`**: A specialized test suite that probes the `TravelAIOrchestrator` and `GroundingGuard` with adversarial prompts to ensure it never hallucinates prices, weather, or availability when the mock/live providers fail.
2. **`test_e2e_flow.py`**: A multi-turn integration test spanning authentication, TripGenie generation, and PackMate context injection.
3. **`test_agent_copilot_e2e.py`**: Tests the strict 9-step Agent Copilot pipeline to verify that `SmartBudget` respects limits, `PackageValidator` catches structural errors, and `ActionGateway` successfully blocks unconfirmed bookings.
