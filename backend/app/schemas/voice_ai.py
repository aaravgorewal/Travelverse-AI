from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .orchestration import TravelContext

class VoiceRequest(BaseModel):
    conversation_id: Optional[str] = None
    audio_base64: str = Field(..., description="The user's speech audio, base64 encoded")
    context: TravelContext = Field(default_factory=TravelContext)

class VoiceResponse(BaseModel):
    conversation_id: str
    transcript: str = Field(..., description="What the STT system heard the user say")
    audio_base64: str = Field(..., description="The AI's speech response, base64 encoded")
    text_response: str = Field(..., description="The AI's text response")
    feature_triggered: str = Field(..., description="Which AI feature handled the request")
