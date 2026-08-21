from typing import List

class ChunkService:
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_text(self, text: str) -> List[str]:
        """
        Recursive character text splitter logic.
        Splits text by double newlines, single newlines, spaces, then characters.
        """
        if not text:
            return []

        # Simplified MVP version of recursive chunking
        chunks = []
        paragraphs = text.split('\n\n')
        
        current_chunk = ""
        for p in paragraphs:
            if len(current_chunk) + len(p) < self.chunk_size:
                current_chunk += p + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # If paragraph itself is too large, hard split it
                if len(p) > self.chunk_size:
                    start = 0
                    while start < len(p):
                        end = start + self.chunk_size
                        chunks.append(p[start:end])
                        start += self.chunk_size - self.overlap
                    current_chunk = ""
                else:
                    current_chunk = p + "\n\n"
                    
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
