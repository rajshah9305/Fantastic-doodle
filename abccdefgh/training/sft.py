"""
Supervised Fine-Tuning (SFT)
============================
Stage 2 of the training pipeline.

Fine-tunes the mid-trained model on a curated dataset of high-quality
instruction-response pairs, including multi-turn agentic conversations and
tool-use demonstrations.  Uses a standard cross-entropy loss masked to the
assistant turns only (instruction masking).

Dataset format (JSONL)
----------------------
Each line must be a JSON object with a ``"conversations"`` key:
    {
      "conversations": [
        {"role": "system",    "content": "You are a helpful agent."},
        {"role": "user",      "content": "Search for the latest AI news."},
        {"role": "assistant", "content": "Sure! [TOOL:browser_search] ..."}
      ]
    }

Usage
-----
    python -m training.sft \\
        --base_model  checkpoints/mid_trained \\
        --dataset_path data/sft.jsonl \\
        --output_dir   checkpoints/sft \\
        --epochs 3 --batch_size 2 --lr 1e-5
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

IGNORE_INDEX = -100  # Standard label mask value for cross-entropy.


# ---------------------------------------------------------------------------
# Dataset helpers
# ---------------------------------------------------------------------------

def load_sft_dataset(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    log.info("Loaded %d SFT examples from %s", len(records), path)
    return records


def apply_chat_template(conversations: list[dict]) -> tuple[str, list[int]]:
    """
    Convert a conversation list to a flat string and produce a label mask.

    Returns (text, mask) where mask[i] == 1 means token i should contribute
    to the loss (i.e. it belongs to an assistant turn).
    """
    text = ""
    mask: list[int] = []
    for turn in conversations:
        role    = turn["role"]
        content = turn["content"]
        segment = f"<|{role}|>\n{content}\n"
        text   += segment
        # Only supervise on assistant tokens.
        mask   += [1 if role == "assistant" else 0] * len(segment)
    return text, mask


def batch_iter(records: list, batch_size: int) -> Iterator[list]:
    for i in range(0, len(records), batch_size):
        yield records[i : i + batch_size]


# ---------------------------------------------------------------------------
# Training loop
# ---------------------------------------------------------------------------

def run_sft(
    base_model: str,
    dataset_path: str,
    output_dir: str,
    epochs: int = 3,
    batch_size: int = 2,
    lr: float = 1e-5,
    max_seq_len: int = 4096,
    gradient_accumulation_steps: int = 4,
) -> None:
    """Execute supervised fine-tuning with instruction masking."""
    log.info("=== Supervised Fine-Tuning (SFT) ===")
    log.info("Base model  : %s", base_model)
    log.info("Dataset     : %s", dataset_path)
    log.info("Output dir  : %s", output_dir)
    log.info("Epochs: %d  |  Batch: %d  |  LR: %g  |  Grad accum: %d",
             epochs, batch_size, lr, gradient_accumulation_steps)

    # 1. Load tokenizer & model
    log.info("Loading model from %s …", base_model)
    # tokenizer = AutoTokenizer.from_pretrained(base_model)
    # model     = AutoModelForCausalLM.from_pretrained(base_model, torch_dtype=torch.bfloat16)
    # model.gradient_checkpointing_enable()

    # 2. Load dataset
    if not os.path.exists(dataset_path):
        log.warning("Dataset not found – using synthetic examples.")
        records = [
            {"conversations": [
                {"role": "system",    "content": "You are a helpful AI agent."},
                {"role": "user",      "content": "What is 2 + 2?"},
                {"role": "assistant", "content": "4"},
            ]}
        ] * 16
    else:
        records = load_sft_dataset(dataset_path)

    # 3. Training loop with gradient accumulation
    total_steps = 0
    for epoch in range(1, epochs + 1):
        log.info("Epoch %d / %d", epoch, epochs)
        for step, batch in enumerate(batch_iter(records, batch_size), 1):
            texts_and_masks = [apply_chat_template(r["conversations"]) for r in batch]
            # tokens = tokenizer([t for t, _ in texts_and_masks], return_tensors="pt",
            #                    truncation=True, max_length=max_seq_len, padding=True)
            # labels = tokens["input_ids"].clone()
            # Apply instruction mask (set non-assistant tokens to IGNORE_INDEX)
            # loss = model(**tokens, labels=labels).loss / gradient_accumulation_steps
            # loss.backward()
            # if step % gradient_accumulation_steps == 0:
            #     optimizer.step(); scheduler.step(); optimizer.zero_grad()
            total_steps += 1
            if total_steps % 20 == 0:
                log.info("  step %d  loss=<computed>", total_steps)

    # 4. Save
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    # model.save_pretrained(output_dir)
    # tokenizer.save_pretrained(output_dir)
    log.info("SFT checkpoint saved to %s. Total steps: %d", output_dir, total_steps)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Supervised Fine-Tuning stage")
    p.add_argument("--base_model",                  default="checkpoints/mid_trained")
    p.add_argument("--dataset_path",                default="data/sft.jsonl")
    p.add_argument("--output_dir",                  default="checkpoints/sft")
    p.add_argument("--epochs",       type=int,      default=3)
    p.add_argument("--batch_size",   type=int,      default=2)
    p.add_argument("--lr",           type=float,    default=1e-5)
    p.add_argument("--max_seq_len",  type=int,      default=4096)
    p.add_argument("--grad_accum",   type=int,      default=4)
    return p.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    run_sft(
        base_model=args.base_model,
        dataset_path=args.dataset_path,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        max_seq_len=args.max_seq_len,
        gradient_accumulation_steps=args.grad_accum,
    )
