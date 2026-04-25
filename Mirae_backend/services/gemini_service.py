import os
import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from datetime import datetime
from typing import List, Dict, Tuple

# Configure Gemini with API key from environment
def init_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    print(genai.list_models())
    return True

# System instruction for the wellness assistant
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
    blocked_topics = [
        "politics", "government", "election",
        "religion", "god", "church", "islam", "christianity"
    ]
    text_lower = text.lower()
    return any(word in text_lower for word in blocked_topics)

def detect_medical_question(text: str) -> bool:
    keywords = [
        "diagnosed", "mental illness", "depression treatment",
        "anxiety disorder", "therapy", "medication", "bipolar"
    ]
    text_lower = text.lower()
    return any(word in text_lower for word in keywords)

class GeminiChatSession:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.chat_history: List[Dict] = []
        self.model = None
        self.chat_session = None
        self.created_at = datetime.utcnow()
        self.crisis_count = 0
        
    def start_chat(self):
        """Initialize a new Gemini chat session"""
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_INSTRUCTION,
            safety_settings={
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        
        # Convert history to Gemini format if exists
        history = []
        for msg in self.chat_history:
            history.append({
                "role": msg["role"],
                "parts": [msg["content"]]
            })
        
        self.chat_session = self.model.start_chat(history=history)
        return self
    
    def add_message(self, role: str, content: str):
        """Add a message to chat history"""
        self.chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        })
        
        # Track crisis patterns
        if role == "user" and self._detect_crisis_pattern(content):
            self.crisis_count += 1
    
    def _detect_crisis_pattern(self, text: str) -> bool:
        """Detect potential crisis keywords"""
        crisis_keywords = [
            "kill myself", "suicide", "end my life", "want to die",
            "hurt myself", "self harm", "can't go on", "no hope",
            "worthless", "don't want to live", "give up"
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in crisis_keywords)
    
    def send_message(self, user_message: str) -> Tuple[str, bool, bool]:
        if detect_out_of_scope(user_message):
            return ("I've noticed that the statements you've made tend to be delving into a sensitive topic...", False, True)

        try:
            # 1. Ask for JSON clearly in the prompt
            full_prompt = f"{user_message}\n\nIMPORTANT: Respond ONLY in JSON format with keys: 'reply', 'isCrisis' (bool), 'isOutOfScope' (bool)."
            
            response = self.chat_session.send_message(
                full_prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )

            # 2. Parse JSON carefully
            data = json.loads(response.text)
            reply = data.get("reply", "I'm here to listen.")
            is_crisis = data.get("isCrisis", False) or self._detect_crisis_pattern(user_message)
            
            return reply, is_crisis, False

        except Exception as e:
            
            print(f"❌ Gemini Runtime Error: {e}") 
            return "I'm having a little trouble processing that. Can we try talking about something else?", False, False
    
    def _format_history_for_context(self) -> str:
        """Format recent chat history for context"""
        if not self.chat_history:
            return "No previous messages."
        
        # Get last 6 messages for context
        recent = self.chat_history[-6:]
        formatted = []
        for msg in recent:
            role = "User" if msg["role"] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['content']}")
        return "\n".join(formatted)
    
    def to_dict(self):
        """Convert session to dictionary for storage"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "message_count": len(self.chat_history),
            "crisis_count": self.crisis_count,
            "last_message": self.chat_history[-1]["content"] if self.chat_history else None,
            "last_message_time": self.chat_history[-1]["timestamp"].isoformat() if self.chat_history else None
        }

# Store active chat sessions in memory (in production, use Redis/Database)
active_sessions: Dict[str, GeminiChatSession] = {}

def get_or_create_chat_session(session_id: str, user_id: str) -> GeminiChatSession:
    """Get existing chat session or create new one"""
    if session_id in active_sessions:
        return active_sessions[session_id]
    
    session = GeminiChatSession(session_id, user_id)
    session.start_chat()
    active_sessions[session_id] = session
    return session

def save_chat_session_to_db(session_id: str, user_id: str, messages: List[Dict]):
    """Save chat session to Firestore for persistence"""
    from services.firebase_service import db
    
    chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
    
    chat_ref.set({
        "session_id": session_id,
        "user_id": user_id,
        "messages": messages,
        "updated_at": datetime.utcnow(),
        "created_at": active_sessions.get(session_id, {}).created_at if session_id in active_sessions else datetime.utcnow()
    })
