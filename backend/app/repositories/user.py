from sqlalchemy.orm import Session
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
