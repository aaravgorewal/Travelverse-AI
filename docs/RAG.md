# Retrieval-Augmented Generation (RAG)

TRAVELVERSE uses RAG to provide accurate, grounded answers regarding company travel policies, destination nuances, and internal agent documentation.

## Pipeline Lifecycle

1. **Ingestion**: Raw documents (PDF, Text, Markdown) are uploaded to the system.
2. **Chunking**: Documents are split into semantic chunks (e.g., 500-token blocks) using `RAGService`.
3. **Embedding**: `GeminiEmbeddingProvider` generates a 768-dimensional float array for each chunk.
4. **Storage**: The chunks and embeddings are stored in Supabase PostgreSQL using the `pgvector` extension (`KnowledgeChunk` model).
5. **Retrieval**: User queries are embedded, and a cosine distance search (`<=>`) is performed against the `pgvector` index to retrieve the Top-K most relevant chunks.
6. **Synthesis**: The `ContextBuilder` injects these chunks into the Gemini prompt as a `trusted_context` block.

## Geographic & RBAC Filtering
The `advanced_similarity_search` enforces SQL-level filters on the vectors:
- **Geographic**: Limits search to documents tagged with the current `destination_id`.
- **Role-Based**: Prevents 'travelers' from querying internal 'agent' handbooks via `metadata_json` filtering.
