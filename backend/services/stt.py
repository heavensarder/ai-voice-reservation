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
    Uses prompt-based guidance for Bengali/Bangla recognition.
    """
    try:
        # OpenAI API requires a file-like object with a filename
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.webm"  # Match frontend format
        
        client = get_client()
        transcript = await client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            # Note: Bengali (bn) is not supported as explicit language
            # Using Bengali prompt to guide the model
            prompt="বাংলা রেস্তোরাঁ রিজার্ভেশন। নাম, ফোন, তারিখ, সময়, অতিথি সংখ্যা। আমি টেবিল বুক করতে চাই। হ্যাঁ, না, ধন্যবাদ।"
        )
        
        return transcript.text
    except Exception as e:
        print(f"STT Error: {e}")
        return ""
