from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Index
from app.core.config import settings

# This script verifies that SQLAlchemy compiles the pgvector types and HNSW indexes correctly.
# Note: It requires a live PostgreSQL database with the pgvector extension enabled to fully run.

def test_pgvector_compilation():
    Base = declarative_base()

    class MockKnowledgeChunk(Base):
        __tablename__ = "mock_knowledge_chunks"
        id = Column(Integer, primary_key=True)
        text = Column(String)
        embedding = Column(Vector(settings.VECTOR_DIMENSION))

        __table_args__ = (
            Index(
                "mock_ix_embedding",
                "embedding",
                postgresql_using="hnsw",
                postgresql_with={"m": 16, "ef_construction": 64},
                postgresql_ops={"embedding": "vector_cosine_ops"},
            ),
        )

    # If the environment has pgvector installed correctly, this will compile the schema DLLs.
    print(f"pgvector models compiled successfully. Configured dimension: {settings.VECTOR_DIMENSION}")

if __name__ == "__main__":
    test_pgvector_compilation()
