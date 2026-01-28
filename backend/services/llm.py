import os
import json
from services.config import get_config_value

# Initialize client dynamically or lazily?
# AsyncOpenAI client is usually stateless regarding the key if passed per request? 
# No, it's init with key. 
# Better: Helper function to get client.

def get_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

SYSTEM_PROMPT = """
You are a polite and professional restaurant reservation assistant for a Bangladeshi restaurant.
You speak ONLY in Bangla (Bengali).
Your goal is to collect the following details for a reservation:
1. Name (নাম)
2. Phone Number (ফোন নম্বর) - Must be a valid Bangladeshi number (11 digits, starts with 01).
3. Date (তারিখ) - DD-MM-YYYY format or relative (today, tomorrow).
4. Time (সময়) - 12hr format with AM/PM.
5. Number of People (কতজন).

CRITICAL RULES:
- The AI MUST speak in Bangla (Bengali).
- Ask ONLY one question at a time.
- Do NOT assume any information.
- Always confirm the details before finalizing.
- When the user CONFIRMS the details, you MUST reply with a final Bangla confirmation message like "ঠিক আছে, আপনার রিজার্ভেশন কনফার্ম করা হয়েছে।" AND then append the JSON.
- DO NOT append the JSON until the user explicitly says YES/Confirm.

When you have ALL the information and confirmed it with the user, output a JSON object in the SPECIFIC FUNCTION CALL format or just indicate completion in text.
Actually, for simplicity in this turn-based flow, just maintain the conversation.
If the reservation is CONFIRMED by the user, add a special marker `[RESERVATION_CONFIRMED]` at the end of your message, followed by the JSON details like:
`[RESERVATION_CONFIRMED] {"name": "...", "phone": "...", "date": "...", "time": "...", "people": ...}`

Current state of conversation:
"""

async def get_ai_response(user_text: str, history: list):
    """
    Generates a response from GPT-4o-mini maintaining history.
    """
    # Add user message to history
    history.append({"role": "user", "content": user_text})
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ] + history
    
    try:
        client = get_client()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7
        )
        
        ai_message = response.choices[0].message.content
        history.append({"role": "assistant", "content": ai_message})
        
        return ai_message, history
    except Exception as e:
        print(f"LLM Error: {e}")
        return "দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।", history
