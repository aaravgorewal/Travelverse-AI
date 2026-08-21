import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.identity import User
from app.repositories.user import user_repo

# Setup an in-memory SQLite database for testing repositories
engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_user_repository_crud(db):
    # 1. Test Create
    user_data = {"email": "test@travelverse.ai", "hashed_password": "hashed_pw", "role": "traveler"}
    user = user_repo.create(db, obj_in=user_data)
    assert user.id is not None
    assert user.email == "test@travelverse.ai"

    # 2. Test Get
    fetched_user = user_repo.get(db, id=user.id)
    assert fetched_user is not None
    assert fetched_user.email == "test@travelverse.ai"

    # 3. Test Get by Email (Custom domain method)
    fetched_by_email = user_repo.get_by_email(db, email="test@travelverse.ai")
    assert fetched_by_email is not None

    # 4. Test Update
    updated_user = user_repo.update(db, db_obj=user, obj_in={"role": "agent"})
    assert updated_user.role == "agent"

    # 5. Test Remove
    user_repo.remove(db, id=user.id)
    deleted_user = user_repo.get(db, id=user.id)
    assert deleted_user is None
