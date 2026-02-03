import os
import json
from google.cloud import speech_v1 as speech
from google.oauth2 import service_account

from services.config import get_config_value

def get_google_speech_client():
    """
    Create Google Cloud Speech client using credentials from config.
    Uses same credentials as TTS (GOOGLE_TTS_CREDENTIALS).
    """
    try:
        # Get JSON credentials from database config (same as TTS)
        credentials_json = get_config_value("GOOGLE_TTS_CREDENTIALS")
        
        if credentials_json and credentials_json.strip():
            credentials_dict = json.loads(credentials_json)
            credentials = service_account.Credentials.from_service_account_info(credentials_dict)
            return speech.SpeechClient(credentials=credentials)
        
        # Fallback: Environment variable for credentials file path
        credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if credentials_path and os.path.exists(credentials_path):
            return speech.SpeechClient()
        
        print("ERROR: No Google Cloud credentials found!")
        return None
        
    except Exception as e:
        print(f"Error creating Google Speech client: {e}")
        return None

async def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Transcribes audio using Google Cloud Speech-to-Text.
    Optimized for Bengali (bn-BD) language.
    """
    try:
        client = get_google_speech_client()
        
        if client is None:
            print("ERROR: Google Cloud Speech client not available!")
            return ""
        
        # Configure audio - WebM from browser
        audio = speech.RecognitionAudio(content=audio_bytes)
        
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,  # WebM default
            language_code="bn-BD",  # Bangladeshi Bengali
            alternative_language_codes=["bn-IN", "en-US"],  # Fallbacks
            enable_automatic_punctuation=True,
            model="default",
        )
        
        # Synchronous recognition (for short audio < 1 min)
        response = client.recognize(config=config, audio=audio)
        
        # Combine all results
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
        
        transcript = transcript.strip()
        
        if transcript:
            print(f"Google STT: {transcript}")
            return transcript
        else:
            print("Google STT: No transcription result")
            return ""
            
    except Exception as e:
        print(f"Google STT Error: {e}")
        return ""
