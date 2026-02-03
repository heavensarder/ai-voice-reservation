import os
import base64
from google.cloud import texttospeech

from services.config import get_config_value
import json
from google.oauth2 import service_account

def get_tts_client():
    creds_json = get_config_value("GOOGLE_TTS_CREDENTIALS")
    
    if creds_json:
        try:
            info = json.loads(creds_json)
            credentials = service_account.Credentials.from_service_account_info(info)
            return texttospeech.TextToSpeechClient(credentials=credentials)
        except Exception as e:
            print(f"Invalid Google Creds in DB: {e}")
            pass
            
    # Fallback to default env vars
    try:
        return texttospeech.TextToSpeechClient()
    except:
        return None

async def synthesize_speech(text: str) -> bytes:
    """
    Synthesizes Bangla speech from text using Google Cloud TTS.
    """
    client = get_tts_client()
    if not client:
        print("Google TTS Client not initialized")
        return None

    try:
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # WaveNet voice for more natural, professional speech
        voice = texttospeech.VoiceSelectionParams(
            language_code="bn-IN",
            name="bn-IN-Wavenet-A",  # WaveNet - more natural than Standard
            ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )

        # Audio config with natural speaking rate
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,  # Normal speed (0.25 to 4.0)
            pitch=0.0,  # Normal pitch (-20 to 20)
        )

        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        return response.audio_content
    except Exception as e:
        print(f"TTS Error: {e}")
        return None
