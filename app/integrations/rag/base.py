from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RAGChunk(BaseModel):
    text: str
    document_id: str
    document_title: str
    standard_number: Optional[str] = None
    clause: Optional[str] = None
    page: Optional[int] = None
    source_url: Optional[str] = None
    retrieval_score: float = Field(default=1.0, ge=0.0, le=1.0)


class BaseRAGProvider(ABC):
    @abstractmethod
    async def retrieve(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5,
    ) -> List[RAGChunk]:
        """Retrieve top_k relevant RAG chunks matching query and optional metadata filters."""
        pass
