import os
import pathlib
import hashlib
import time
from typing import Dict, Any, List

from pymongo import MongoClient, UpdateOne
from sentence_transformers import SentenceTransformer

MONGO_URI = os.getenv("MONGODB_URI")
AI_DB = os.getenv("MONGO_AI_DB", "ai_db")
COLL_NAME = os.getenv("RAG_COLL_NAME", "chunks")
VECTOR_FIELD = os.getenv("RAG_VECTOR_FIELD", "vector")
MODEL_NAME = os.getenv("AI_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

client = MongoClient(MONGO_URI) if MONGO_URI else MongoClient()
col = client[AI_DB][COLL_NAME]
model = SentenceTransformer(MODEL_NAME)


def file_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def chunk_text(text: str, size: int = 1000, overlap: int = 150) -> List[str]:
    out, i = [], 0
    length = len(text)
    while i < length:
        out.append(text[i : i + size])
        i += max(1, size - overlap)
    return [c.strip() for c in out if c and c.strip()]


def embed(texts: List[str]) -> List[List[float]]:
    # normalize for cosine similarity
    vecs = model.encode(texts, normalize_embeddings=True)
    return [[float(x) for x in v] for v in vecs]


def upsert_doc(doc_id: str, content: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    # idempotency via content hash
    h = file_hash(content)
    prev = col.find_one({"doc_id": doc_id}, {"docHash": 1})
    if prev and prev.get("docHash") == h:
        return {"ok": True, "doc_id": doc_id, "chunks": 0, "skipped": True}

    chunks = chunk_text(content, size=int(meta.get("chunk_size", 1000)), overlap=int(meta.get("overlap", 150)))
    if not chunks:
        # delete any prior chunks if content became empty
        col.delete_many({"doc_id": doc_id})
        return {"ok": True, "doc_id": doc_id, "chunks": 0, "skipped": False}

    vecs = embed(chunks)

    now = int(time.time())
    ops = []
    for i, (c, v) in enumerate(zip(chunks, vecs)):
        ops.append(
            UpdateOne(
                {"doc_id": doc_id, "chunk_id": i},
                {
                    "$set": {
                        "doc_id": doc_id,
                        "chunk_id": i,
                        "text": c,
                        VECTOR_FIELD: v,
                        "meta": {
                            "title": meta.get("title", ""),
                            "section": meta.get("section", ""),
                            "tags": meta.get("tags", []),
                            "version": meta.get("version", "v1"),
                        },
                        "docHash": h,
                        "updated_at": now,
                    }
                },
                upsert=True,
            )
        )

    if ops:
        col.bulk_write(ops)
        # remove stale chunks if new chunk count shrank
        col.delete_many({"doc_id": doc_id, "chunk_id": {"$gte": len(chunks)}})

    return {"ok": True, "doc_id": doc_id, "chunks": len(chunks), "skipped": False}


def read_text_file(path: pathlib.Path) -> str:
    return path.read_text(encoding="utf-8")

