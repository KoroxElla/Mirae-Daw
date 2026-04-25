import os
import json
from google import genai
from google.genai import types
from datetime import datetime
from typing import List, Dict, Tuple

def init_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    client = genai.Client(api_key=api_key)
    # Testing the connection - new SDK way to list models
    # for model in client.models.list(): print(model.name)
    return client

SYSTEM_INSTRUCTION = """You are a mental health wellness assistant called "Mirae". 
Strictly avoid Politics, Religion, and Medical advice. 
If a user is in crisis, return JSON with "isCrisis": true."""

def detect_out_of_scope(text: str) -> bool:
    blocked = ["politics", "election", "religion", "god", "church"]
    return any(word in text.lower() for word in blocked)

class GeminiChatSession:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.chat_history: List[Dict] = []
        self.client = init_gemini()
        self.model_id = "gemini-3-flash-preview" 
        self.crisis_count = 0
        
    def _detect_crisis_pattern(self, text: str) -> bool:
        keywords = ["kill myself", "suicide", "end my life", "want to die"]
        return any(keyword in text.lower() for keyword in keywords)
    
    def send_message(self, user_message: str) -> Tuple[str, bool, bool]:
        if detect_out_of_scope(user_message):
            return ("I've noticed that the statements you've made tend to be delving into a sensitive topic...", False, True)
        
        try:
            # Prepare chat history for the new SDK
            self.chat_history.append({"role": "user", "content": user_message})
            if self._detect_crisis_pattern(user_message): self.crisis_count += 1

            contents = [
                types.Content(
                    role="user" if m["role"] == "user" else "model",
                    parts=[types.Part.from_text(text=m["content"])]
                ) for m in self.chat_history
            ]

            # ✅ FIXED: Thinking level must be inside ThinkingConfig
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.7,
                    thinking_config=types.ThinkingConfig(
                        thinking_level="LOW"
                    )
                )
            )

            ai_data = json.loads(response.text)
            reply = ai_data.get('reply', "I'm listening.")
            is_crisis = ai_data.get('isCrisis', False) or (self.crisis_count >= 1)
            
            self.chat_history.append({"role": "assistant", "content": reply})
            return reply, is_crisis, False
            
        except Exception as e:
            print(f"❌ Gemini 3 API Error: {e}")
            return "I'm here to listen. Tell me more.", False, False

# Helpers
active_sessions = {}
def get_or_create_chat_session(session_id, user_id):
    if session_id not in active_sessions:
        active_sessions[session_id] = GeminiChatSession(session_id, user_id)
    return active_sessions[session_id]