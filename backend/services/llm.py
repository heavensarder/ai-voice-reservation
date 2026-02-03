import os
import json
from openai import AsyncOpenAI
from services.config import get_config_value

def get_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

# Default System Prompt
# Default System Prompt
DEFAULT_SYSTEM_PROMPT = """
You are a helpful AI Assistant for a Restaurant Reservation System called 'Bhojone'.
Your Goal: Collect reservation details from the user: Name, Phone, Date, Time, and Number of Guests.

Rules:
1. Speak in mixed Bangla (primary) and English (natural conversational style).
2. Ask for missing details one by one.
3. When you have ALL details (Name, Phone, Date, Time, Guests), you MUST output the details in JSON format prefixed by [REVIEW_DETAILS].
   Example:
   [REVIEW_DETAILS]
   {
     "name": "John Doe",
     "phone": "01712345678",
     "date": "2023-10-25",
     "time": "08:00 PM",
     "people": "4"
   }
   "Sir, I have listed your details. Shall I confirm?"

4. Provide the JSON *only* when asking for confirmation.
5. If the user confirms (says "Yes", "Confirm", "Thik ache"), output [CONFIRM_RESERVATION] and a thank you message.
   Example: 
   [CONFIRM_RESERVATION]
   Thank you! Your booking is confirmed.

6. If the user rejects or wants changes, ask for the new details and show [REVIEW_DETAILS] again.
"""

async def get_ai_response(user_text: str, history: list):
    """
    Generates a response from GPT-4o-mini maintaining history.
    No tool calls - simplified flow.
    """
    # Fetch dynamic prompt or use default
    system_prompt = get_config_value("SYSTEM_PROMPT", DEFAULT_SYSTEM_PROMPT)
    if not system_prompt or len(system_prompt) < 10:
        system_prompt = DEFAULT_SYSTEM_PROMPT
        
    # Inject Current Date/Time Context
    from datetime import datetime
    now_str = datetime.now().strftime("%A, %d-%m-%Y %I:%M %p")
    system_prompt += f"\n\nCURRENT CONTEXT:\n- Today is: {now_str}\n- Assume the current year is {datetime.now().year} unless specified."

    # Add user message to history
    history.append({"role": "user", "content": user_text})
    
    messages = [
        {"role": "system", "content": system_prompt}
    ] + history
    
    try:
        client = get_client()
        
        # Simple LLM call without tools
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7
        )
        
        ai_message = response.choices[0].message.content
        history.append({"role": "assistant", "content": ai_message})
        
        # Return: intermediate_text (None), ai_message, history
        # Keep the same return signature for compatibility with main.py
        return None, ai_message, history
    except Exception as e:
        print(f"LLM Error: {e}")
        return None, "নিচে কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার বলুন।", history
