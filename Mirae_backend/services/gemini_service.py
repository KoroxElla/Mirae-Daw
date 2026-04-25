import os
import json
import uuid
from google import genai
from google.genai import types
from datetime import datetime
from typing import List, Dict, Tuple

# 1. Gemini Client Initialization
def init_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    return genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """You are a mental health wellness assistant called "Mirae". 
Strictly avoid Politics, Religion, and Medical advice. 
If a user is in crisis, return JSON with "isCrisis": true.
Response format MUST be valid JSON: {"reply": "...", "isCrisis": bool, "isOutOfScope": bool}"""

# 2. Utility Functions
def detect_out_of_scope(text: str) -> bool:
    blocked = ["politics", "election", "religion", "god", "church", "christianity", "islam"]
    return any(word in text.lower() for word in blocked)

def detect_medical_question(text: str) -> bool:
    keywords = ["diagnosed", "mental illness", "depression treatment", "anxiety disorder", "therapy", "medication", "bipolar"]
    return any(word in text.lower() for word in keywords)

# 3. Chat Session Class
class GeminiChatSession:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.chat_history: List[Dict] = []
        self.client = init_gemini()
        self.model_id = "gemini-3.1-flash-preview" 
        self.created_at = datetime.utcnow()
        self.crisis_count = 0
        
    def _detect_crisis_pattern(self, text: str) -> bool:
        keywords = ["kill myself", "suicide", "end my life", "want to die", "hurt myself", "self harm"]
        return any(keyword in text.lower() for keyword in keywords)
    
    def send_message(self, user_message: str) -> Tuple[str, bool, bool]:
        if detect_out_of_scope(user_message):
            return ("I've noticed that the statements you've made tend to be delving into a sensitive topic...", False, True)
        
        try:
            if self._detect_crisis_pattern(user_message): 
                self.crisis_count += 1

            # Prepare history for Gemini 3
            contents = []
            for m in self.chat_history:
                role = "user" if m["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=m["content"])]))
            
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.7,
                    thinking_config=types.ThinkingConfig(thinking_level="LOW")
                )
            )

            ai_data = json.loads(response.text)
            reply = ai_data.get('reply', "I'm listening.")
            is_crisis = ai_data.get('isCrisis', False) or (self.crisis_count >= 1)
            is_out_of_scope = ai_data.get('isOutOfScope', False)
            
            # Sync local history
            self.chat_history.append({"role": "user", "content": user_message})
            self.chat_history.append({"role": "assistant", "content": reply})
            
            return reply, is_crisis, is_out_of_scope
            
        except Exception as e:
            print(f"❌ Gemini 3 API Error: {e}")
            return "I'm here to listen. Tell me more about your day.", False, False

# 4. Route Helpers (Required by chat_routes.py)
active_sessions: Dict[str, GeminiChatSession] = {}

def get_or_create_chat_session(session_id: str, user_id: str) -> GeminiChatSession:
    if session_id not in active_sessions:
        active_sessions[session_id] = GeminiChatSession(session_id, user_id)
        
        # Hydrate from Firestore if session exists
        from services.firebase_service import db
        doc = db.collection("users").document(user_id).collection("chats").document(session_id).get()
        if doc.exists:
            active_sessions[session_id].chat_history = doc.to_dict().get("messages", [])
            
    return active_sessions[session_id]

def save_chat_session_to_db(session_id: str, user_id: str, messages: List[Dict]):
    """Sync chat session to Firestore"""
    from services.firebase_service import db
    chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
    chat_ref.set({
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages,
        "updated_at": datetime.utcnow()
    }, merge=True)