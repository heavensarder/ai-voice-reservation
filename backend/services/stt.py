import os
import io
from openai import AsyncOpenAI

from services.config import get_config_value

def get_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

async def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Transcribes audio bytes using OpenAI Whisper API.
    """
    try:
        # OpenAI API requires a file-like object with a filename
        # We wrap bytes in a BytesIO
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.wav"  # Important for OpenAI to know format
        
        client = get_client()
        transcript = await client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            prompt="Bengali, English conversation."
        )
        
        return transcript.text
    except Exception as e:
        print(f"STT Error: {e}")
        return ""
