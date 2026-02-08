import os
import json
from openai import AsyncOpenAI
from services.config import get_config_value

def get_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

# Default System Prompt
# Default System Prompt

async def get_ai_response(user_text: str, history: list):
    """
    Generates a response from GPT-4o-mini maintaining history.
    No tool calls - simplified flow.
    """
    # Fetch dynamic prompt from Admin Dashboard Settings
    # ABSOLUTE RULE: DO NOT use a hardcoded default here. User manages it via UI.
    system_prompt = get_config_value("SYSTEM_PROMPT", "")
        
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
            model="gpt-3.5-turbo",
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
