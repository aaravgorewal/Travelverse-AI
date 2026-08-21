import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.providers.ai_base import AIProvider
from unittest.mock import AsyncMock

# A simple mock AI provider that returns fixed strings instead of calling Gemini
class MockAIProvider(AIProvider):
    def __init__(self, should_fail=False):
        self.should_fail = should_fail
        
    async def generate_text(self, prompt: str, system_instruction: str = None, **kwargs) -> str:
        if self.should_fail:
            raise RuntimeError("Simulated AI Failure")
        return "Mocked AI Response"

    async def generate_structured(self, prompt: str, schema: any, system_instruction: str = None, **kwargs) -> any:
        if self.should_fail:
            raise RuntimeError("Simulated AI Failure")
        # Return an empty/default instance of the schema if possible, or a dict for BaseModel
        try:
            return schema()
        except:
            return {}

    async def generate_with_tools(self, prompt: str, tools: list, system_instruction: str = None, **kwargs) -> any:
        if self.should_fail:
            raise RuntimeError("Simulated AI Failure")
        return {"tool_called": "mocked"}

    async def stream(self, prompt: str, system_instruction: str = None, **kwargs):
        if self.should_fail:
            raise RuntimeError("Simulated AI Failure")
        yield "Mocked "
        yield "AI "
        yield "Stream"


@pytest.fixture
def client():
    # Provide the standard test client
    with TestClient(app) as c:
        yield c

@pytest.fixture
def agent_token():
    return "tv_sess_agent_test"

@pytest.fixture
def traveler_token():
    return "tv_sess_traveler_test"
