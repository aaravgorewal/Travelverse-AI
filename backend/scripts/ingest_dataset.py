import os
import sys
import json
import shutil
import logging
from pathlib import Path

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.database.session import SessionLocal
from app.models.rag import KnowledgeDocument, KnowledgeChunk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).parent.parent / "data" / "processed"
ERRORS_DIR = Path(__file__).parent.parent / "data" / "errors"

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Basic sliding window chunker."""
    if not text:
        return []
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i : i + chunk_size])
        i += (chunk_size - overlap)
    return chunks

def mock_get_embedding(text: str) -> list[float]:
    """Mock Gemini embedding generator returning [0.0, ...] * 768"""
    return [0.0] * 768

def process_file(filepath: Path, db):
    logger.info(f"Processing: {filepath.name}")
    
    # We will simulate JSON loading for structured metadata extraction. 
    # The actual implementation would use pandas/csv/json depending on filepath.suffix
    try:
        if filepath.suffix == ".json":
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Validation: Never invent missing dataset fields
            if not isinstance(data, dict):
                raise ValueError("Expected a JSON object.")
                
            required_fields = ["title", "content", "source", "source_url", "license"]
            for field in required_fields:
                if field not in data or not data[field]:
                    logger.warning(f"File {filepath.name} missing required field: {field}. Skipping file.")
                    return False
            
            # Duplicate Detection
            exists = db.query(KnowledgeDocument).filter(KnowledgeDocument.source_url == data["source_url"]).first()
            if exists:
                logger.warning(f"Document {data['source_url']} already ingested. Skipping to prevent duplicates.")
                return True
                
            # 1. Insert Document
            doc = KnowledgeDocument(
                title=data["title"],
                source=data["source"],
                source_url=data["source_url"],
                license=data["license"],
                document_type=data.get("document_type", "article"),
                version=data.get("dataset_version", "1.0"),
                content=data["content"]
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
            
            # 2. Chunking & Embeddings
            chunks = chunk_text(data["content"])
            chunk_objects = []
            
            for index, chunk_text_content in enumerate(chunks):
                embedding = mock_get_embedding(chunk_text_content) # Would call real EmbeddingService here
                
                chunk_obj = KnowledgeChunk(
                    document_id=doc.id,
                    chunk_index=index,
                    text=chunk_text_content,
                    metadata_json={"source": data["source"]},
                    embedding=embedding
                )
                chunk_objects.append(chunk_obj)
            
            # 3. Bulk Insert Chunks
            db.add_all(chunk_objects)
            db.commit()
            
            logger.info(f"Successfully ingested {filepath.name} -> {len(chunk_objects)} chunks.")
            return True
            
        else:
            logger.warning(f"Unsupported file type: {filepath.suffix}")
            return False
            
    except Exception as e:
        logger.error(f"Error processing {filepath.name}: {str(e)}")
        db.rollback()
        return False

def run_ingestion_pipeline():
    logger.info("Starting Dataset Ingestion Pipeline...")
    db = SessionLocal()
    report = {"success": 0, "failed": 0, "total": 0}
    
    try:
        if not RAW_DIR.exists():
            logger.warning("No data/raw directory found. Skipping ingestion.")
            return
            
        for filepath in RAW_DIR.iterdir():
            if filepath.is_file():
                report["total"] += 1
                success = process_file(filepath, db)
                
                target_dir = PROCESSED_DIR if success else ERRORS_DIR
                target_dir.mkdir(parents=True, exist_ok=True)
                shutil.move(str(filepath), str(target_dir / filepath.name))
                
                if success:
                    report["success"] += 1
                else:
                    report["failed"] += 1
                    
        logger.info(f"Ingestion Report: {report}")
    finally:
        db.close()

if __name__ == "__main__":
    run_ingestion_pipeline()
