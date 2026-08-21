import os
from pathlib import Path

REPO_DIR = Path("backend/app/repositories")
REPO_DIR.mkdir(parents=True, exist_ok=True)

base_repo = """from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy.orm import Session
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
"""

user_repo = """from sqlalchemy.orm import Session
from app.models.identity import User, Customer
from .base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
        
    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(self.model).filter(self.model.email == email).first()

class CustomerRepository(BaseRepository[Customer]):
    def __init__(self):
        super().__init__(Customer)

user_repo = UserRepository()
customer_repo = CustomerRepository()
"""

trips_repo = """from sqlalchemy.orm import Session
from app.models.trips import Trip
from app.models.bookings import Booking
from .base import BaseRepository

class TripRepository(BaseRepository[Trip]):
    def __init__(self):
        super().__init__(Trip)

class BookingRepository(BaseRepository[Booking]):
    def __init__(self):
        super().__init__(Booking)

trip_repo = TripRepository()
booking_repo = BookingRepository()
"""

inventory_repo = """from sqlalchemy.orm import Session
from app.models.inventory import Destination, Place, Activity
from .base import BaseRepository

class DestinationRepository(BaseRepository[Destination]):
    def __init__(self):
        super().__init__(Destination)

class PlaceRepository(BaseRepository[Place]):
    def __init__(self):
        super().__init__(Place)

class ActivityRepository(BaseRepository[Activity]):
    def __init__(self):
        super().__init__(Activity)

destination_repo = DestinationRepository()
place_repo = PlaceRepository()
activity_repo = ActivityRepository()
"""

ai_repo = """from sqlalchemy.orm import Session
from app.models.ai import Conversation, AIMemory
from app.models.rag import KnowledgeChunk
from .base import BaseRepository

class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self):
        super().__init__(Conversation)

class MemoryRepository(BaseRepository[AIMemory]):
    def __init__(self):
        super().__init__(AIMemory)

class KnowledgeRepository(BaseRepository[KnowledgeChunk]):
    def __init__(self):
        super().__init__(KnowledgeChunk)
        
    def similarity_search(self, db: Session, query_embedding: list, limit: int = 5):
        # Uses pgvector cosine distance operator <=>
        return db.query(self.model).order_by(self.model.embedding.cosine_distance(query_embedding)).limit(limit).all()

conversation_repo = ConversationRepository()
memory_repo = MemoryRepository()
knowledge_repo = KnowledgeRepository()
"""

system_repo = """from sqlalchemy.orm import Session
from app.models.system import Notification
from .base import BaseRepository

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self):
        super().__init__(Notification)

notification_repo = NotificationRepository()
"""

init_repo = """from .user import user_repo, customer_repo
from .trips import trip_repo, booking_repo
from .inventory import destination_repo, place_repo, activity_repo
from .ai import conversation_repo, memory_repo, knowledge_repo
from .system import notification_repo
"""

if __name__ == "__main__":
    (REPO_DIR / "base.py").write_text(base_repo)
    (REPO_DIR / "user.py").write_text(user_repo)
    (REPO_DIR / "trips.py").write_text(trips_repo)
    (REPO_DIR / "inventory.py").write_text(inventory_repo)
    (REPO_DIR / "ai.py").write_text(ai_repo)
    (REPO_DIR / "system.py").write_text(system_repo)
    (REPO_DIR / "__init__.py").write_text(init_repo)
    print("Repositories created successfully.")
