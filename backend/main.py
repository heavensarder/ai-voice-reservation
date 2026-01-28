import os
import json
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables explicitly before importing services that use them
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from services.stt import transcribe_audio
from services.llm import get_ai_response
from services.tts import synthesize_speech

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bangla AI Voice Reservation Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Voice Backend is Running"}

@app.get("/debug")
async def debug_config():
    from services.config import get_config_value
    openai_key = get_config_value("OPENAI_API_KEY")
    google_creds = get_config_value("GOOGLE_TTS_CREDENTIALS")
    
    return {
        "database_connection": "OK" if openai_key is not None or google_creds is not None else "UNKNOWN (Check DB logs)",
        "openai_api_key": "FOUND" if openai_key and len(openai_key) > 5 else "MISSING or EMPTY",
        "google_tts_creds": "FOUND" if google_creds and len(google_creds) > 5 else "MISSING or EMPTY"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connected")
    
    conversation_history = []
    
    # Send initial greeting
    greeting_text = "নমস্কার! আমি আপনার রিজার্ভেশন অ্যাসিস্ট্যান্ট। আমি আপনাকে কীভাবে সাহায্য করতে পারি?"
    greeting_audio = await synthesize_speech(greeting_text)
    
    await websocket.send_json({
        "type": "text",
        "role": "ai",
        "content": greeting_text
    })
    
    if greeting_audio:
         # Send audio as bytes
        await websocket.send_bytes(greeting_audio)

    try:
        while True:
            # Receive audio chunk or message
            # For simplicity, we assume client sends JSON with event type or raw bytes?
            # A common pattern: Client sends raw audio bytes for stream, or JSON for control.
            # To listen continuously, we might receive bytes.
            
            # Let's assume the client sends JSON envelopes for messages and Binary for audio?
            # Or simpler: Client records chunks -> sends -> server processes.
            # Real-time WebSocket audio streaming usually requires a VAD on CLIENT or SERVER.
            # We'll assume CLIENT sends a final blob of audio when silence is detected (turn-based) 
            # OR streams chunks and we use server-side VAD.
            # Requirement: "Capture microphone audio in small chunks... Receive Transcribed... etc."
            
            # Implementation Strategy: 
            # 1. Receive message.
            # 2. If valid audio -> Transcribe.
            # 3. If transcript -> LLM.
            # 4. LLM -> TTS -> Send Audio.
            
            message = await websocket.receive()
            
            if "bytes" in message:
                audio_data = message["bytes"]
                logger.info(f"Received audio chunk: {len(audio_data)} bytes")
                
                # Transcribe (Simulated or Real)
                # In a real stream, we'd buffer until silence. 
                # For this task, we'll assume the client sends a "finished" utterance or we process chunks.
                # Let's assume the frontend performs VAD and sends a complete sentence audio blob.
                
                transcript = await transcribe_audio(audio_data)
                
                if transcript:
                    logger.info(f"User: {transcript}")
                    
                    # Send buffer transcript to UI
                    await websocket.send_json({
                        "type": "text",
                        "role": "user",
                        "content": transcript
                    })
                    
                    # Get AI Response
                    ai_response_text, updated_history = await get_ai_response(transcript, conversation_history)
                    conversation_history = updated_history
                    
                    logger.info(f"AI: {ai_response_text}")

                    # Check for RESERVATION_CONFIRMED
                    if "[RESERVATION_CONFIRMED]" in ai_response_text:
                        parts = ai_response_text.split("[RESERVATION_CONFIRMED]")
                        spoken_text = parts[0].strip()
                        json_str = parts[1].strip()
                        
                        # Send the spoken text as usual
                        await websocket.send_json({
                            "type": "text",
                            "role": "ai",
                            "content": spoken_text
                        })
                        
                        # Synthesize audio for the spoken part
                        audio_response = await synthesize_speech(spoken_text)
                        if audio_response:
                            await websocket.send_bytes(audio_response)
                        
                        # Parse JSON and send structured event
                        try:
                            reservation_data = json.loads(json_str)
                            await websocket.send_json({
                                "type": "reservation_confirmed",
                                "data": reservation_data
                            })
                            logger.info(f"Reservation Data: {reservation_data}")
                        except json.JSONDecodeError:
                            logger.error("Failed to parse reservation JSON")
                            
                    else:
                        # Normal response
                        await websocket.send_json({
                            "type": "text",
                            "role": "ai",
                            "content": ai_response_text
                        })
                        
                        # TTS
                        audio_response = await synthesize_speech(ai_response_text)
                        if audio_response:
                            await websocket.send_bytes(audio_response)
                        
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"Error: {e}")
        await websocket.close()
