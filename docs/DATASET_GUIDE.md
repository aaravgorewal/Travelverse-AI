# Dataset & Knowledge Base Guide

TRAVELVERSE leverages a vector knowledge base to ground the LLM's responses regarding travel policies, destination guides, and visa rules.

## Ingestion Pipeline
To add new documents into the system:

1. Place raw text or PDF documents into a staging directory (or upload via the admin portal).
2. The `KnowledgeIngestionService` (`backend/app/services/ingestion.py`) parses the documents.
3. The parsed text is split into chunks of ~500 tokens with slight overlap.
4. Each chunk is sent to the `GeminiEmbeddingProvider` to calculate its vector representation.
5. The chunks are saved in the `knowledge_chunks` table within Supabase, using the `pgvector` data type for the embedding column.

## Updating Vectors
To flush or recalculate embeddings (e.g., if switching embedding models):
1. Issue a TRUNCATE to the `knowledge_chunks` table.
2. Re-run the `KnowledgeIngestionService.process_all()` script.
