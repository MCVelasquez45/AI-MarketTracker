import os
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer

MONGODB_URI = os.getenv("MONGODB_URI")
AI_DB = os.getenv("MONGO_AI_DB", "ai_db")
VEC_DIM = int(os.getenv("AI_VECTOR_DIM", "384"))

client = MongoClient(MONGODB_URI) if MONGODB_URI else MongoClient()
ai_db = client[AI_DB]
chunks = ai_db["chunks"]
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

app = FastAPI()


class DocIn(BaseModel):
    doc_id: str
    text: str


class IndexIn(BaseModel):
    docs: List[DocIn]
    chunk_size: int = 400


@app.post("/index")
def index_docs(inp: IndexIn):
    to_write = []
    for d in inp.docs:
        text = d.text.strip()
        for i in range(0, len(text), inp.chunk_size):
            chunk = text[i:i + inp.chunk_size]
            vec = model.encode([chunk])[0].tolist()
            to_write.append({
                "doc_id": d.doc_id,
                "chunk_id": f"{d.doc_id}#{i}",
                "text": chunk,
                "vector": vec,
                "meta": {},
                "updated_at": datetime.datetime.utcnow()
            })
    if to_write:
        chunks.insert_many(to_write)
    return {"ok": True, "n": len(to_write)}


class RetrieveIn(BaseModel):
    query: str
    top_k: int = 6


@app.post("/retrieve")
def retrieve(inp: RetrieveIn):
    qvec = model.encode([inp.query])[0]
    # naive similarity in Mongo (if Atlas Vector Search is not configured yet)
    # for Atlas Vector Search, replace with $vectorSearch aggregation
    docs = list(chunks.find({}, {"text": 1, "doc_id": 1, "chunk_id": 1, "vector": 1}).limit(2000))

    def cos(a, b):
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(x * x for x in b) ** 0.5
        return dot / (na * nb + 1e-9)

    scored = sorted(docs, key=lambda d: cos(d["vector"], qvec.tolist()), reverse=True)[:inp.top_k]
    ctx = ""
    cites = []
    for d in scored[:4]:
        ctx += f"[{d['doc_id']}#{d['chunk_id']}] {d['text']}\n"
        cites.append(f"{d['doc_id']}#{d['chunk_id']}")
    return {"context": ctx.strip(), "citations": cites}

# run: uvicorn main:app --reload --port 8001

