import os
import json
from google import genai
from google.genai import types
from datetime import datetime
from typing import List, Dict, Tuple

# 1. Initialize Client (New 2026 SDK Method)
def init_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    # Returns the new GenAI Client
    return genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """You are a mental health wellness assistant called "Mirae". You are NOT a therapist or medical professional. 
Your goal is to provide supportive wellness tips, empathetic listening, and gentle guidance.

STRICT SCOPE - DO NOT discuss these topics:
- Politics or political figures
- Religious beliefs or practices  
- Sensitive social debates
- Medical advice or diagnoses

BOUNDARY RESPONSE - If the user brings up restricted topics, you MUST use this exact phrase:
"I've noticed that the statements you've made tend to be delving into a sensitive topic that my coding is restricting me to converse in, so I would suggest we redirect this conversation. How are you feeling about your day today?"

CRISIS PROTOCOL - If the user expresses ANY of the following, set isCrisis=true:
- Suicidal thoughts or self-harm
- Severe depression or hopelessness
- Thoughts of hurting themselves or others
- Extreme distress or feeling like they can't cope

Remember: You are here to support, listen, and provide wellness resources when appropriate. Be warm, empathetic, and conversational."""

def detect_out_of_scope(text: str) -> bool:
    blocked_topics = ["politics", "government", "election", "religion", "god", "church", "islam", "christianity"]
    return any(word in text.lower() for word in blocked_topics)

def detect_medical_question(text: str) -> bool:
    keywords = ["diagnosed", "mental illness", "depression treatment", "anxiety disorder", "therapy", "medication", "bipolar"]
    return any(word in text.lower() for word in keywords)

class GeminiChatSession:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.chat_history: List[Dict] = []
        # Modern client-based initialization
        self.client = init_gemini()
        self.model_id = "gemini-3.1-flash-preview" # Updated to stable 2026 model
        self.created_at = datetime.utcnow()
        self.crisis_count = 0
        
    def start_chat(self):
        # In the new SDK, history is passed inside the generate_content call
        return self
    
    def add_message(self, role: str, content: str):
        self.chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        })
        if role == "user" and self._detect_crisis_pattern(content):
            self.crisis_count += 1
    
    def _detect_crisis_pattern(self, text: str) -> bool:
        crisis_keywords = ["kill myself", "suicide", "end my life", "want to die", "hurt myself", "self harm", "can't go on", "no hope", "worthless", "don't want to live", "give up"]
        return any(keyword in text.lower() for keyword in crisis_keywords)
    
    def send_message(self, user_message: str) -> Tuple[str, bool, bool]:
        # 1. Scope Checks
        if detect_out_of_scope(user_message):
            return ("I've noticed that the statements you've made tend to be delving into a sensitive topic that my coding is restricting me to converse in, so I would suggest we redirect this conversation. How are you feeling about your day today?", False, True)
        
        if detect_medical_question(user_message):
            return ("I'm really glad you reached out, but I'm not a medical professional and can't provide medical advice...", False, True)
        
        try:
            self.add_message("user", user_message)
            
            # Format history for the new SDK structure
            contents = []
            for msg in self.chat_history:
                role = "user" if msg["role"] == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg["content"])]))

            # 2. Call Gemini 3.1
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    thinking_level="LOW", # New 2026 feature for Flash models
                    temperature=0.7,
                )
            )

            # 3. Parse JSON Response
            ai_data = json.loads(response.text)
            reply = ai_data.get('reply', "I'm here to listen.")
            is_crisis = ai_data.get('isCrisis', False) or (self.crisis_count >= 1)
            is_out_of_scope = ai_data.get('isOutOfScope', False)
            
            self.add_message("assistant", reply)
            return reply, is_crisis, is_out_of_scope
            
        except Exception as e:
            print(f"❌ Gemini 3 API Error: {e}")
            return "I'm here to listen. Can you tell me more about what's on your mind?", False, False

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "message_count": len(self.chat_history),
            "crisis_count": self.crisis_count
        }

# Helpers
active_sessions: Dict[str, GeminiChatSession] = {}

def get_or_create_chat_session(session_id: str, user_id: str) -> GeminiChatSession:
    if session_id not in active_sessions:
        active_sessions[session_id] = GeminiChatSession(session_id, user_id)
    return active_sessions[session_id]

def save_chat_session_to_db(session_id: str, user_id: str, messages: List[Dict]):
    from services.firebase_service import db
    chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
    chat_ref.set({
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages,
        "updated_at": datetime.utcnow()
    }, merge=True)