import asyncio
import os
import json
import csv
import sys
import uuid
from datetime import datetime
from pathlib import Path

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.schemas.ingestion import IngestedRecord
from app.models.rag import RAGDocument, RAGDocumentChunk
from app.models.dataset import DatasetRegistry
from app.core.config import settings
from app.services.rag_pipeline import RAGPipeline

db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if "postgresql://" in settings.DATABASE_URL else "sqlite+aiosqlite:///./test.db"
engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

ERROR_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "../../data/errors"
ERROR_DIR.mkdir(parents=True, exist_ok=True)

class IngestionReport:
    def __init__(self):
        self.records_processed = 0
        self.records_inserted = 0
        self.records_updated = 0
        self.records_skipped = 0
        self.records_rejected = 0
        self.errors = []

    def log_error(self, record, error_msg):
        self.records_rejected += 1
        self.errors.append({"record": record, "error": str(error_msg)})

    def print_report(self):
        print("\n--- INGESTION REPORT ---")
        print(f"Processed: {self.records_processed}")
        print(f"Inserted:  {self.records_inserted}")
        print(f"Updated:   {self.records_updated}")
        print(f"Skipped:   {self.records_skipped}")
        print(f"Rejected:  {self.records_rejected}")
        if self.errors:
            print(f"Total Errors: {len(self.errors)}")
            error_file = ERROR_DIR / f"ingestion_errors_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(error_file, "w") as f:
                json.dump(self.errors, f, indent=2)
            print(f"Errors written to: {error_file}")

from app.services.rag.rag_service import RAGService

# ... in the imports section, replace the old import
# (I'll just replace the process_record logic directly to use RAGService)

async def process_record(session: AsyncSession, record_data: dict, report: IngestionReport):
    report.records_processed += 1
    try:
        record = IngestedRecord(**record_data)
    except ValidationError as e:
        report.log_error(record_data, e)
        return

    # Check if duplicate in dataset registry
    stmt = select(DatasetRegistry).where(DatasetRegistry.dataset_name == record.dataset_name, DatasetRegistry.version == record.dataset_version)
    result = await session.execute(stmt)
    dataset = result.scalars().first()

    if not dataset:
        dataset = DatasetRegistry(
            dataset_name=record.dataset_name,
            version=record.dataset_version,
            source=record.source,
            license=record.license,
            record_count=0
        )
        session.add(dataset)
        await session.flush()

    # Determine if it's unstructured text for RAG or structured payload
    payload = record.payload
    if "text" in payload and len(payload.keys()) == 1:
        rag_service = RAGService()
        doc_id = await rag_service.ingest_document(
            session=session,
            category=record.dataset_name,
            title=record.record_id,
            text=payload["text"],
            source_url=record.source_url,
            source=record.source,
            version=record.dataset_version
        )
        if doc_id:
            report.records_inserted += 1
            dataset.record_count += 1
        else:
            report.records_skipped += 1
    else:
        dataset.record_count += 1
        report.records_inserted += 1

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        report.log_error(record_data, f"DB Error: {e}")

async def ingest_file(file_path: str, default_metadata: dict):
    report = IngestionReport()
    path = Path(file_path)
    
    if not path.exists():
        print(f"File not found: {file_path}")
        return

    print(f"Ingesting {file_path}...")
    async with AsyncSessionLocal() as session:
        ext = path.suffix.lower()
        if ext == ".jsonl":
            with open(path, "r") as f:
                for line in f:
                    data = default_metadata.copy()
                    try:
                        data.update(json.loads(line))
                        if "payload" not in data:
                            data["payload"] = json.loads(line)
                        await process_record(session, data, report)
                    except json.JSONDecodeError as e:
                        report.log_error(line, f"JSON parse error: {e}")
        elif ext == ".json":
            with open(path, "r") as f:
                content = json.load(f)
                if isinstance(content, list):
                    for item in content:
                        data = default_metadata.copy()
                        data.update(item)
                        if "payload" not in data:
                            data["payload"] = item
                        await process_record(session, data, report)
                else:
                    data = default_metadata.copy()
                    data.update(content)
                    if "payload" not in data:
                        data["payload"] = content
                    await process_record(session, data, report)
        elif ext == ".csv":
            with open(path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data = default_metadata.copy()
                    # map row to payload
                    data["payload"] = dict(row)
                    # if metadata fields are in CSV, pull them up
                    for k in ["dataset_name", "dataset_version", "source", "source_url", "license", "record_id"]:
                        if k in row:
                            data[k] = row[k]
                    
                    if "record_id" not in data:
                        data["record_id"] = str(uuid.uuid4())
                        
                    await process_record(session, data, report)
        elif ext in [".txt", ".md"]:
            with open(path, "r") as f:
                text = f.read()
                data = default_metadata.copy()
                data["payload"] = {"text": text}
                if "record_id" not in data:
                    data["record_id"] = path.name
                if "source_url" not in data:
                    data["source_url"] = str(path.absolute())
                await process_record(session, data, report)
        else:
            print(f"Unsupported format: {ext}")
            return
            
    report.print_report()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest.py <file_path> [dataset_name] [license]")
        sys.exit(1)
        
    file_path = sys.argv[1]
    
    metadata = {
        "dataset_name": sys.argv[2] if len(sys.argv) > 2 else "default_dataset",
        "dataset_version": "1.0",
        "source": "cli_ingest",
        "license": sys.argv[3] if len(sys.argv) > 3 else "proprietary",
        "record_id": str(uuid.uuid4())
    }
    
    asyncio.run(ingest_file(file_path, metadata))
