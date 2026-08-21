import logging
import base64
from typing import Optional

logger = logging.getLogger(__name__)

class SpeechProvider:
    """
    Abstractions for Speech-to-Text (STT) and Text-to-Speech (TTS).
    """
    
    async def transcribe(self, audio_base64: str) -> str:
        """Converts Base64 audio into text."""
        raise NotImplementedError
        
    async def synthesize(self, text: str) -> str:
        """Converts text into Base64 audio."""
        raise NotImplementedError


class MockSpeechProvider(SpeechProvider):
    """
    Mock implementation for development to prevent blocking on API keys.
    """
    
    async def transcribe(self, audio_base64: str) -> str:
        logger.info("Mock STT: Transcribing audio bytes to text.")
        # We would decode base64, send to GCP/OpenAI, and get text back.
        # For the mock, we assume the user just said "Book a flight to Paris" if they sent valid base64.
        if not audio_base64:
            raise ValueError("No audio provided.")
        return "I need a 5-night trip to Dubai for my family."
        
    async def synthesize(self, text: str) -> str:
        logger.info(f"Mock TTS: Synthesizing audio for text length {len(text)}")
        # We would send text to GCP/OpenAI, get binary audio back, and encode to base64.
        # Here we just return a fake base64 string.
        fake_audio_binary = b"RIFF... WAVEfmt ... fake audio data based on text: " + text.encode('utf-8')
        return base64.b64encode(fake_audio_binary).decode('utf-8')
