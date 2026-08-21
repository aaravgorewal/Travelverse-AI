from pydantic import BaseModel, ConfigDict
from uuid import UUID

class RAGContext(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    content: str
    source: str
    source_url: str
    document_id: UUID
    relevance_score: float
