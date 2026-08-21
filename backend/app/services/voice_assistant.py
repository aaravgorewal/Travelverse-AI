import logging
from typing import Optional

from app.schemas.voice_ai import VoiceRequest, VoiceResponse
from app.schemas.orchestration import ChatRequest
from app.ai.orchestrator import TravelAIOrchestrator
from app.providers.speech import MockSpeechProvider

logger = logging.getLogger(__name__)

class VoiceAssistantService:
    """
    Voice wrapper around the Travel AI Orchestrator.
    Provides STT -> Orchestrator -> TTS flow without inventing new travel logic.
    """
    
    def __init__(self, orchestrator: TravelAIOrchestrator):
        self.orchestrator = orchestrator
        self.speech_provider = MockSpeechProvider()

    async def handle_voice(self, request: VoiceRequest) -> VoiceResponse:
        logger.info("Processing incoming voice request.")
        
        # 1. STT (Speech-to-Text)
        try:
            transcript = await self.speech_provider.transcribe(request.audio_base64)
            logger.info(f"Transcribed audio: '{transcript}'")
        except Exception as e:
            logger.error(f"STT failed: {e}")
            raise RuntimeError("Failed to transcribe audio.")
            
        # 2. Text Orchestrator (Re-use exact same logic as /chat)
        logger.info("Passing transcript to TravelAIOrchestrator...")
        orchestrator_response = await self.orchestrator.execute(transcript, request.context)
        
        # 3. TTS (Text-to-Speech)
        try:
            audio_response = await self.speech_provider.synthesize(orchestrator_response.response)
            logger.info("Synthesized text response into audio.")
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            raise RuntimeError("Failed to synthesize audio response.")
            
        feature_name = orchestrator_response.intent if orchestrator_response.intent else "Global Assistant"
            
        return VoiceResponse(
            conversation_id=request.conversation_id or "new",
            transcript=transcript,
            audio_base64=audio_response,
            text_response=orchestrator_response.response,
            feature_triggered=feature_name
        )
