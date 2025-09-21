import argparse
import pathlib
from rag_ingest import upsert_doc, read_text_file


def main():
    p = argparse.ArgumentParser(description="Batch-ingest markdown/text into RAG store")
    p.add_argument("--root", required=True, help="Folder containing .md/.txt files")
    p.add_argument("--tags", nargs="*", default=[], help="Tags to attach")
    p.add_argument("--chunk_size", type=int, default=1000)
    p.add_argument("--overlap", type=int, default=150)
    args = p.parse_args()

    root = pathlib.Path(args.root)
    files = [*root.rglob("*.md"), *root.rglob("*.txt")]
    if not files:
        print(f"No .md/.txt files found under {root}")
        return

    updated = 0
    skipped = 0

    for fp in files:
        doc_id = fp.name
        text = read_text_file(fp)
        meta = {
            "title": fp.stem.replace("-", " "),
            "tags": args.tags,
            "chunk_size": args.chunk_size,
            "overlap": args.overlap,
            "version": "v1",
        }
        res = upsert_doc(doc_id, text, meta)
        print(f"[{doc_id}] chunks={res['chunks']} skipped={res['skipped']}")
        updated += 0 if res.get("skipped") else 1
        skipped += 1 if res.get("skipped") else 0

    print(f"\nDone. {updated} files updated, {skipped} skipped (no change).")


if __name__ == "__main__":
    main()

