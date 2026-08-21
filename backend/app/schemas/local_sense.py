from pydantic import BaseModel, Field
from typing import List, Optional

class DestinationKnowledgeRequest(BaseModel):
    destination: str
    specific_questions: List[str] = Field(default_factory=list, description="e.g. ['Do I need to tip?', 'Is public transit safe at night?']")

class RAGSource(BaseModel):
    source_id: str
    source_title: str
    source_type: str

class DestinationKnowledgeResult(BaseModel):
    culture_and_etiquette: str = Field(..., description="Summary of cultural norms and etiquette.")
    food_and_transport: str = Field(..., description="Summary of local cuisine and how to get around.")
    general_advice: List[str] = Field(..., description="Soft recommendations, tips, and guidelines.")
    official_regulations: List[str] = Field(..., description="Hard rules, visa requirements, prohibited items, laws.")
    sources: List[RAGSource] = Field(default_factory=list, description="List of RAG documents used to generate this response.")
