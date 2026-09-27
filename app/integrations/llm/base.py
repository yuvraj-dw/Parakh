from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.integrations.rag.base import RAGChunk


class Citation(BaseModel):
    document_title: str
    standard_number: Optional[str] = None
    clause: Optional[str] = None
    page: Optional[int] = None
    source_url: Optional[str] = None
    verified_in_db: bool = False


class LLMResult(BaseModel):
    answer: str
    citations: List[Citation] = Field(default_factory=list)
    tokens_used: int = 0


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[RAGChunk],
        system_instruction: str = "",
    ) -> LLMResult:
        """Synthesize answers grounded strictly in retrieved context_chunks with citations."""
        pass

    @abstractmethod
    async def extract_product_attributes(self, text: str) -> Dict[str, Any]:
        """Extract product type, material, intended use, and technical parameters from text."""
        pass
