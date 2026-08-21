#!/usr/bin/env python3
import os
import sys
import json
import csv
import logging
import uuid
from pathlib import Path
from datetime import datetime
from pydantic import ValidationError

# Ensure the app module can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.schemas.ingestion import IngestedRecord

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
ERROR_DIR = DATA_DIR / "errors"

def save_error(file_path: Path, raw_content: any, error_msg: str):
    """Saves the invalid record and reason to the errors directory."""
    error_file = ERROR_DIR / f"error_{file_path.name}_{uuid.uuid4().hex[:8]}.json"
    error_data = {
        "original_file": str(file_path),
        "error": error_msg,
        "content": raw_content,
        "timestamp": datetime.utcnow().isoformat()
    }
    with open(error_file, "w", encoding="utf-8") as f:
        json.dump(error_data, f, indent=2, default=str)
    logger.error(f"Validation failed for record in {file_path.name}: {error_msg}. Saved to {error_file.name}")

def process_record(raw_dict: dict, file_path: Path) -> Optional[IngestedRecord]:
    """Validates a single dictionary record against the Pydantic schema."""
    try:
        record = IngestedRecord(**raw_dict)
        return record
    except ValidationError as e:
        save_error(file_path, raw_dict, str(e))
        return None
    except Exception as e:
        save_error(file_path, raw_dict, f"Unexpected error: {str(e)}")
        return None

def ingest_json(file_path: Path) -> list[IngestedRecord]:
    valid_records = []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # Handle both single objects and arrays
    if isinstance(data, dict):
        data = [data]
        
    for item in data:
        record = process_record(item, file_path)
        if record:
            valid_records.append(record)
    return valid_records

def ingest_jsonl(file_path: Path) -> list[IngestedRecord]:
    valid_records = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            if not line.strip():
                continue
            try:
                item = json.loads(line)
                record = process_record(item, file_path)
                if record:
                    valid_records.append(record)
            except json.JSONDecodeError as e:
                save_error(file_path, line, f"JSON Decode Error on line {line_num}: {str(e)}")
    return valid_records

def ingest_csv(file_path: Path) -> list[IngestedRecord]:
    valid_records = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row_num, row in enumerate(reader, 1):
            # CSV rows are flat dictionaries. The ingestor must map these to the schema.
            # Assuming the CSV contains the required top-level fields (source, license, etc)
            # and we bundle everything else into 'payload'.
            try:
                # Extract known schema fields if they exist
                schema_keys = {"dataset_name", "source", "source_id", "license", "created_at", "updated_at"}
                top_level = {k: v for k, v in row.items() if k in schema_keys}
                payload = {k: v for k, v in row.items() if k not in schema_keys}
                
                raw_dict = {
                    **top_level,
                    "payload": payload
                }
                
                record = process_record(raw_dict, file_path)
                if record:
                    valid_records.append(record)
            except Exception as e:
                save_error(file_path, row, f"CSV processing error on row {row_num}: {str(e)}")
    return valid_records

def ingest_text_based(file_path: Path, format_type: str) -> list[IngestedRecord]:
    """Handles TXT, Markdown, and PDF-derived text. Expects metadata in a structured way or generic fallback."""
    valid_records = []
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # For raw text without explicit metadata in the file, we expect the user to provide it 
    # via CLI args or a sidecar config file. For this framework, if it lacks metadata, 
    # the Pydantic schema will catch it and route it to errors.
    
    # Try parsing frontmatter if markdown? For now, we simulate a raw dict construction.
    raw_dict = {
        # These would ideally be parsed from frontmatter or CLI arguments
        "dataset_name": "unknown_text_corpus",
        "source": "local_file",
        "source_id": file_path.name,
        "license": "unknown", # This will trigger validation failure intentionally
        "payload": {
            "content": content,
            "format": format_type
        }
    }
    
    record = process_record(raw_dict, file_path)
    if record:
        valid_records.append(record)
    return valid_records

def main():
    if not RAW_DIR.exists():
        logger.error(f"Raw data directory not found: {RAW_DIR}")
        sys.exit(1)
        
    logger.info(f"Scanning {RAW_DIR} for datasets...")
    
    total_valid = 0
    total_files = 0
    
    for file_path in RAW_DIR.iterdir():
        if file_path.is_file() and not file_path.name.startswith('.'):
            total_files += 1
            ext = file_path.suffix.lower()
            logger.info(f"Processing {file_path.name}...")
            
            valid_records = []
            if ext == '.json':
                valid_records = ingest_json(file_path)
            elif ext == '.jsonl':
                valid_records = ingest_jsonl(file_path)
            elif ext == '.csv':
                valid_records = ingest_csv(file_path)
            elif ext in ['.txt', '.md', '.pdf_text']:
                valid_records = ingest_text_based(file_path, ext.strip('.'))
            else:
                logger.warning(f"Unsupported file format: {ext} for {file_path.name}")
                continue
            
            total_valid += len(valid_records)
            logger.info(f"Successfully processed {len(valid_records)} valid records from {file_path.name}")
            
            # Move file to processed
            processed_path = PROCESSED_DIR / file_path.name
            file_path.rename(processed_path)
            logger.info(f"Moved {file_path.name} to {PROCESSED_DIR.name}/")

    logger.info(f"Ingestion complete. Processed {total_files} files resulting in {total_valid} valid records.")

if __name__ == "__main__":
    main()
