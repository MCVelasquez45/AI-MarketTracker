import os
import json
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None

PROVIDER = os.getenv("LLM_PROVIDER", "openai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if (OpenAI and OPENAI_API_KEY) else None

app = FastAPI()


class Msg(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    messages: List[Msg]
    toolResults: Dict[str, Any] | None = None


def build_prompt(msgs: List[Msg], tools: Dict[str, Any] | None) -> str:
    ctx = ""
    for m in msgs:
        ctx += f"[{m.role.upper()}]\n{m.content}\n\n"
    if tools:
        ctx += f"[TOOL_RESULTS]\n{json.dumps(tools)}\n\n"
    ctx += "Output JSON first (strategy), then a 2-3 sentence rationale."
    return ctx


async def stream_openai(prompt: str):
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        temperature=0.2,
        max_tokens=500,
    )
    for chunk in resp:
        if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
            yield f"data: {chunk.choices[0].delta.content}\n\n"
    yield "data: [DONE]\n\n"


async def stream_stub():
    fake = {
        "action": "RECOMMENDATION",
        "strategy": "0DTE_SELL_PUT",
        "ticker": "SPX",
        "deltaTarget": 0.18,
        "expiry": "2025-09-21",
        "confidence": 0.64,
    }
    yield f"data: {json.dumps(fake)}\n\n"
    await asyncio.sleep(0.2)
    yield "data: Recommend Δ≈0.18 put credit spread. No major events; price>VWAP.\n\n"
    yield "data: [DONE]\n\n"


@app.post("/completion/stream")
async def completion_stream(inp: ChatIn):
    prompt = build_prompt(inp.messages, inp.toolResults)
    gen = stream_openai(prompt) if (PROVIDER == "openai" and client) else stream_stub()
    return StreamingResponse(gen, media_type="text/event-stream")

# run: `

