import json
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class ContextBuilder:
    """
    Assembles, prioritizes, and truncates contextual data for the LLM prompt.
    Enforces a strict priority order and a maximum token/character limit.
    """
    
    # 30,000 chars is roughly 7,500 tokens. A safe size for most prompts to avoid overwhelming context window limits.
    MAX_CONTEXT_CHARS = 30000 
    
    def __init__(self, max_chars: int = MAX_CONTEXT_CHARS):
        self.max_chars = max_chars

    def _safe_serialize(self, data: Any) -> str:
        """Safely serialize data to JSON string without crashing."""
        if not data:
            return ""
        if isinstance(data, str):
            return data
        try:
            return json.dumps(data, default=str)
        except Exception as e:
            logger.warning(f"Context serialization error: {e}")
            return str(data)

    def _truncate(self, text: str, remaining_chars: int) -> str:
        """Truncate text to fit within remaining character limit."""
        if len(text) <= remaining_chars:
            return text
        # Truncate and add a marker
        return text[:remaining_chars - 3] + "..."

    def _clean_pii(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Strip unnecessary personal identifiable information."""
        safe_profile = profile.copy()
        # Remove highly sensitive fields that the AI doesn't need for travel planning
        for field in ["password", "credit_card", "ssn", "billing_address", "phone_number"]:
            if field in safe_profile:
                del safe_profile[field]
        return safe_profile

    def build_context(self, 
                      user_request: str, 
                      live_api_results: Optional[Dict[str, Any]] = None, 
                      current_trip: Optional[Dict[str, Any]] = None, 
                      booking_data: Optional[Dict[str, Any]] = None, 
                      customer_preferences: Optional[Dict[str, Any]] = None, 
                      rag_documents: Optional[List[Dict[str, Any]]] = None,
                      user_profile: Optional[Dict[str, Any]] = None,
                      destination_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Assembles the context string strictly adhering to priority order.
        Priority:
        1. Current user request
        2. Live trusted data (API results)
        3. Current booking/trip
        4. Relevant customer preferences
        5. RAG knowledge
        6. General model knowledge (implicit, handled by Gemini)
        """
        
        context_parts = []
        current_chars = 0
        
        def append_section(title: str, content: str):
            nonlocal current_chars
            if not content or current_chars >= self.max_chars:
                return
                
            section_str = f"=== {title.upper()} ===\n{content}\n\n"
            
            # If adding this section exceeds limits, truncate it
            if current_chars + len(section_str) > self.max_chars:
                allowed_chars = self.max_chars - current_chars
                section_str = self._truncate(section_str, allowed_chars)
                
            context_parts.append(section_str)
            current_chars += len(section_str)

        # 1. User Request (Highest Priority)
        append_section("User Request", user_request)
        
        # 2. Live Trusted Data
        if live_api_results:
            append_section("Live System Data (Strict Ground Truth)", self._safe_serialize(live_api_results))
            
        if destination_data:
            append_section("Destination Context", self._safe_serialize(destination_data))

        # 3. Current Booking/Trip
        if current_trip:
            append_section("Active Trip Context", self._safe_serialize(current_trip))
            
        if booking_data:
            append_section("Booking State", self._safe_serialize(booking_data))

        # 4. Relevant Customer Preferences (Sanitized)
        pref_context = {}
        if user_profile:
            pref_context["Profile"] = self._clean_pii(user_profile)
        if customer_preferences:
            pref_context["Preferences"] = self._clean_pii(customer_preferences)
            
        if pref_context:
            append_section("User & Customer Preferences", self._safe_serialize(pref_context))

        # 5. RAG Knowledge
        if rag_documents:
            # RAG documents are a list of dicts. We serialize them sequentially until we hit the char limit.
            rag_str = ""
            for doc in rag_documents:
                doc_str = f"Source: {doc.get('metadata', {}).get('title', 'Unknown')} ({doc.get('metadata', {}).get('source_url', 'Unknown')})\n"
                doc_str += f"Content: {doc.get('text', '')}\n\n"
                rag_str += doc_str
                
            append_section("Knowledge Base (RAG Documents)", rag_str)

        final_context = "".join(context_parts)
        return final_context
