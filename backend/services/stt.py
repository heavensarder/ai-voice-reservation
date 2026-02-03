import os
import io
import json
import base64
from google.cloud import speech_v1 as speech
from google.oauth2 import service_account
from openai import AsyncOpenAI

from services.config import get_config_value

def get_openai_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

def get_google_speech_client():
    """
    Create Google Cloud Speech client using credentials from config.
    Uses same credentials as TTS (GOOGLE_TTS_CREDENTIALS).
    """
    try:
        # Get JSON credentials from database config (same as TTS)
        credentials_json = get_config_value("GOOGLE_TTS_CREDENTIALS")
        
        if credentials_json and credentials_json.strip():
            # Parse JSON credentials
            try:
                credentials_dict = json.loads(credentials_json)
                credentials = service_account.Credentials.from_service_account_info(credentials_dict)
                return speech.SpeechClient(credentials=credentials)
            except json.JSONDecodeError:
                print("Invalid JSON in GOOGLE_CLOUD_CREDENTIALS, trying file path...")
        
        # Second try: Environment variable for credentials file path
        credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if credentials_path and os.path.exists(credentials_path):
            return speech.SpeechClient()
        
        print("WARNING: No Google Cloud credentials found. Falling back to Whisper.")
        return None
        
    except Exception as e:
        print(f"Error creating Google Speech client: {e}")
        return None

async def transcribe_audio_google(audio_bytes: bytes) -> str:
    """
    Transcribes audio using Google Cloud Speech-to-Text.
    Optimized for Bengali (bn-BD) language.
    """
    try:
        client = get_google_speech_client()
        
        if client is None:
            # Fallback to Whisper if Google Cloud not configured
            return await transcribe_audio_whisper(audio_bytes)
        
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
        # Fallback to Whisper on error
        print("Falling back to Whisper...")
        return await transcribe_audio_whisper(audio_bytes)

async def transcribe_audio_whisper(audio_bytes: bytes) -> str:
    """
    Fallback: Transcribes audio using OpenAI Whisper API.
    """
    try:
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.webm"
        
        client = get_openai_client()
        transcript = await client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file,
            prompt="বাংলা রেস্তোরাঁ রিজার্ভেশন। নাম, ফোন, তারিখ, সময়, অতিথি সংখ্যা। আমি টেবিল বুক করতে চাই। হ্যাঁ, না, ধন্যবাদ।"
        )
        
        return transcript.text
    except Exception as e:
        print(f"Whisper STT Error: {e}")
        return ""

async def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Main transcription function.
    Uses Google Cloud Speech-to-Text if configured, otherwise falls back to Whisper.
    """
    # Check which STT provider to use
    stt_provider = get_config_value("STT_PROVIDER", "google")
    
    if stt_provider.lower() == "whisper":
        return await transcribe_audio_whisper(audio_bytes)
    else:
        return await transcribe_audio_google(audio_bytes)
