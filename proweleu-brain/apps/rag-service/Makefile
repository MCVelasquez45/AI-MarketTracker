.PHONY: env rag-up embed search clean-venv

ENV?=.env
DOCS?=../../docs/proweleu-brain/knowledge

env:
	@[ -f $(ENV) ] || (echo "Missing $(ENV). Copy from ops/.env.example and fill values." && exit 1)

rag-up: env
	. .venv/bin/activate 2>/dev/null || python3 -m venv .venv && . .venv/bin/activate; \
	pip install -r requirements.txt; \
	uvicorn main:app --reload --port 8001

embed: env
	. .venv/bin/activate 2>/dev/null || python3 -m venv .venv && . .venv/bin/activate; \
	pip install -r requirements.txt; \
	python ingest_folder.py --root $(DOCS) --tags 0DTE rules spx --chunk_size 1000 --overlap 150

search:
	curl -s -X POST http://127.0.0.1:8001/retrieve \
	 -H "content-type: application/json" \
	 -d '{"query":"late-day SPX 0DTE credit spreads delta 12–20 with event-day guardrails","top_k":6}' | jq

clean-venv:
	rm -rf .venv

