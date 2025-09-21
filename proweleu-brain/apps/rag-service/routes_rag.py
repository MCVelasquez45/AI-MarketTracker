from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from rag_ingest import upsert_doc


router = APIRouter()


class IngestDoc(BaseModel):
    doc_id: str
    text: str
    title: Optional[str] = ""
    tags: List[str] = []
    version: str = "v1"
    chunk_size: int = 1000
    overlap: int = 150


class IngestBatch(BaseModel):
    docs: List[IngestDoc]


@router.post("/ingest")
def ingest(d: IngestBatch):
    out = []
    for doc in d.docs:
        meta = {
            "title": doc.title,
            "tags": doc.tags,
            "version": doc.version,
            "chunk_size": doc.chunk_size,
            "overlap": doc.overlap,
        }
        out.append(upsert_doc(doc.doc_id, doc.text, meta))
    return {"ok": True, "results": out}

