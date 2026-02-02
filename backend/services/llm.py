import os
import json
from openai import AsyncOpenAI
from services.config import get_config_value

# Initialize client dynamically or lazily?
# AsyncOpenAI client is usually stateless regarding the key if passed per request? 
# No, it's init with key. 
# Better: Helper function to get client.

def get_client():
    api_key = get_config_value("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key)

from services.db import check_slot_availability

# ... (Previous imports)

# Tool Definition
AVAILABILITY_TOOL = [
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Checks if a restaurant reservation slot is available for a given date and time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {
                        "type": "string",
                        "description": "Date in DD-MM-YYYY format"
                    },
                    "time": {
                        "type": "string",
                        "description": "Time in HH:MM AM/PM format (e.g. 05:30 PM)"
                    }
                },
                "required": ["date", "time"]
            }
        }
    }
]

# ... SYSTEM PROMPT ...
DEFAULT_SYSTEM_PROMPT = "System prompt not configured. Please configure it in the Admin Dashboard."

async def get_ai_response(user_text: str, history: list):
    """
    Generates a response from GPT-4o-mini maintaining history and handling tool calls.
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
        
        # First Call: User -> LLM (with Tools)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=AVAILABILITY_TOOL,
            tool_choice="auto", 
            temperature=0.7
        )
        
        response_message = response.choices[0].message
        
        intermediate_text = None
        
        # Handle Tool Calls
        if response_message.tool_calls:
            # Capture any text spoken *with* the tool call (e.g. "Checking availability...")
            if response_message.content:
                intermediate_text = response_message.content

            # Append AI's reasoning/tool_call to history
            messages.append(response_message)
            history.append(response_message.model_dump()) # Store for context
            
            for tool_call in response_message.tool_calls:
                if tool_call.function.name == "check_availability":
                    args = json.loads(tool_call.function.arguments)
                    print(f"Tool Call: check_availability({args})")
                    
                    # Call local DB function
                    result = check_slot_availability(args["date"], args["time"])
                    
                    # Append Tool Result
                    tool_msg = {
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": "check_availability",
                        "content": json.dumps(result)
                    }
                    messages.append(tool_msg)
                    history.append(tool_msg) # Persist tool result in history
                    
            # Second Call: Tool Results -> LLM -> Final Answer
            final_response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages, # Now contains User + AI Tool Call + Tool Result
                temperature=0.7
            )
            
            ai_message = final_response.choices[0].message.content
        else:
            ai_message = response_message.content
            
        history.append({"role": "assistant", "content": ai_message})
        
        return intermediate_text, ai_message, history
    except Exception as e:
        print(f"LLM Error: {e}")
        return None, "নিচে কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার বলুন।", history
