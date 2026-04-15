"""
Mid-Training Refinement
=======================
Stage 1 of the training pipeline.

Continues pre-training a base language model on a domain-specific corpus to
adapt its representations before supervised fine-tuning.  This stage uses a
standard causal-LM objective (next-token prediction) on a curated dataset of
agentic conversations, tool-use traces, and technical documentation.

Usage
-----
    python -m training.mid_training \\
        --base_model  "meta-llama/Llama-3.1-8B" \\
        --dataset_path data/mid_train.jsonl \\
        --output_dir   checkpoints/mid_trained \\
        --epochs 1 --batch_size 4 --lr 2e-5
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from pathlib import Path
from typing import Iterator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Dataset helpers
# ---------------------------------------------------------------------------

def load_jsonl(path: str) -> list[dict]:
    """Load a JSONL file where each line is ``{"text": "..."}``."""
    records = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    log.info("Loaded %d records from %s", len(records), path)
    return records


def batch_iter(records: list, batch_size: int) -> Iterator[list]:
    for i in range(0, len(records), batch_size):
        yield records[i : i + batch_size]


# ---------------------------------------------------------------------------
# Training loop (framework-agnostic stub with real structure)
# ---------------------------------------------------------------------------

def run_mid_training(
    base_model: str,
    dataset_path: str,
    output_dir: str,
    epochs: int = 1,
    batch_size: int = 4,
    lr: float = 2e-5,
    max_seq_len: int = 2048,
) -> None:
    """
    Execute mid-training refinement.

    In a real deployment replace the stub model/tokenizer calls with your
    preferred framework (HuggingFace Transformers + PEFT / DeepSpeed / FSDP).
    """
    log.info("=== Mid-Training Refinement ===")
    log.info("Base model  : %s", base_model)
    log.info("Dataset     : %s", dataset_path)
    log.info("Output dir  : %s", output_dir)
    log.info("Epochs      : %d  |  Batch size: %d  |  LR: %g", epochs, batch_size, lr)

    # 1. Load tokenizer & model
    log.info("Loading tokenizer and model …")
    # tokenizer = AutoTokenizer.from_pretrained(base_model)
    # model     = AutoModelForCausalLM.from_pretrained(base_model, torch_dtype=torch.bfloat16)

    # 2. Load dataset
    if not os.path.exists(dataset_path):
        log.warning("Dataset not found at %s – running in dry-run mode.", dataset_path)
        records = [{"text": "Example agentic trace for mid-training."}] * 8
    else:
        records = load_jsonl(dataset_path)

    # 3. Training loop
    total_steps = 0
    for epoch in range(1, epochs + 1):
        log.info("Epoch %d / %d", epoch, epochs)
        for batch in batch_iter(records, batch_size):
            # tokens = tokenizer([r["text"] for r in batch], return_tensors="pt",
            #                    truncation=True, max_length=max_seq_len, padding=True)
            # loss   = model(**tokens, labels=tokens["input_ids"]).loss
            # loss.backward(); optimizer.step(); optimizer.zero_grad()
            total_steps += 1
            if total_steps % 10 == 0:
                log.info("  step %d  loss=<computed>", total_steps)

    # 4. Save checkpoint
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    # model.save_pretrained(output_dir)
    # tokenizer.save_pretrained(output_dir)
    log.info("Checkpoint saved to %s", output_dir)
    log.info("Mid-training complete. Total steps: %d", total_steps)


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Mid-training refinement stage")
    p.add_argument("--base_model",   default="meta-llama/Llama-3.1-8B")
    p.add_argument("--dataset_path", default="data/mid_train.jsonl")
    p.add_argument("--output_dir",   default="checkpoints/mid_trained")
    p.add_argument("--epochs",       type=int,   default=1)
    p.add_argument("--batch_size",   type=int,   default=4)
    p.add_argument("--lr",           type=float, default=2e-5)
    p.add_argument("--max_seq_len",  type=int,   default=2048)
    return p.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    run_mid_training(
        base_model=args.base_model,
        dataset_path=args.dataset_path,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        max_seq_len=args.max_seq_len,
    )
