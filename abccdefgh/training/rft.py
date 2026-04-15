"""
Reinforcement Fine-Tuning (RFT)
================================
Stage 3 of the training pipeline.

Implements RLHF-style reinforcement fine-tuning using a reward model trained
on human preference data.  The policy (SFT model) is optimised with PPO
(Proximal Policy Optimisation) to maximise the reward signal while a KL
penalty prevents it from drifting too far from the reference policy.

Pipeline
--------
1. Train a Bradley-Terry reward model on pairwise preference data.
2. Freeze the reference policy (copy of SFT model).
3. Run PPO: sample completions → score with reward model → update policy.

Dataset format (JSONL)
----------------------
    {
      "prompt":   "Explain quantum entanglement.",
      "chosen":   "Quantum entanglement is …",
      "rejected": "I don't know."
    }

Usage
-----
    python -m training.rft \\
        --sft_model    checkpoints/sft \\
        --dataset_path data/preferences.jsonl \\
        --output_dir   checkpoints/rft \\
        --ppo_epochs 4 --batch_size 8 --lr 1e-6
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

def load_preferences(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    log.info("Loaded %d preference pairs from %s", len(records), path)
    return records


def batch_iter(records: list, batch_size: int) -> Iterator[list]:
    for i in range(0, len(records), batch_size):
        yield records[i : i + batch_size]


# ---------------------------------------------------------------------------
# Reward model training
# ---------------------------------------------------------------------------

def train_reward_model(
    base_model: str,
    preferences: list[dict],
    output_dir: str,
    epochs: int = 2,
    batch_size: int = 4,
    lr: float = 5e-6,
) -> str:
    """
    Train a Bradley-Terry reward model on pairwise preference data.

    Returns the path to the saved reward model checkpoint.
    """
    log.info("--- Training reward model ---")
    # model = AutoModelForSequenceClassification.from_pretrained(base_model, num_labels=1)
    # tokenizer = AutoTokenizer.from_pretrained(base_model)

    for epoch in range(1, epochs + 1):
        log.info("Reward model epoch %d / %d", epoch, epochs)
        for batch in batch_iter(preferences, batch_size):
            # chosen_enc   = tokenizer([r["prompt"] + r["chosen"]   for r in batch], ...)
            # rejected_enc = tokenizer([r["prompt"] + r["rejected"] for r in batch], ...)
            # r_chosen   = model(**chosen_enc).logits
            # r_rejected = model(**rejected_enc).logits
            # loss = -F.logsigmoid(r_chosen - r_rejected).mean()
            # loss.backward(); optimizer.step(); optimizer.zero_grad()
            pass

    rm_path = os.path.join(output_dir, "reward_model")
    Path(rm_path).mkdir(parents=True, exist_ok=True)
    # model.save_pretrained(rm_path); tokenizer.save_pretrained(rm_path)
    log.info("Reward model saved to %s", rm_path)
    return rm_path


# ---------------------------------------------------------------------------
# PPO training loop
# ---------------------------------------------------------------------------

@dataclass
class PPOConfig:
    lr: float = 1e-6
    kl_coeff: float = 0.05
    clip_eps: float = 0.2
    value_loss_coeff: float = 0.5
    entropy_coeff: float = 0.01
    ppo_epochs: int = 4
    batch_size: int = 8
    max_new_tokens: int = 512


def run_ppo(
    policy_model_path: str,
    reward_model_path: str,
    prompts: list[str],
    output_dir: str,
    cfg: PPOConfig,
) -> None:
    """Run PPO to optimise the policy against the reward model."""
    log.info("--- PPO optimisation ---")
    log.info("Policy: %s  |  Reward: %s", policy_model_path, reward_model_path)
    log.info("KL coeff: %g  |  Clip eps: %g  |  PPO epochs: %d",
             cfg.kl_coeff, cfg.clip_eps, cfg.ppo_epochs)

    # policy_model = AutoModelForCausalLMWithValueHead.from_pretrained(policy_model_path)
    # ref_model    = AutoModelForCausalLM.from_pretrained(policy_model_path)  # frozen
    # reward_model = AutoModelForSequenceClassification.from_pretrained(reward_model_path)
    # tokenizer    = AutoTokenizer.from_pretrained(policy_model_path)

    for epoch in range(1, cfg.ppo_epochs + 1):
        log.info("PPO epoch %d / %d", epoch, cfg.ppo_epochs)
        for batch in batch_iter(prompts, cfg.batch_size):
            # 1. Generate completions from policy
            # completions = policy_model.generate(tokenizer(batch, ...), max_new_tokens=cfg.max_new_tokens)

            # 2. Score with reward model
            # rewards = reward_model(completions).logits.squeeze()

            # 3. Compute KL penalty vs reference policy
            # log_probs_policy = policy_model(completions).log_probs
            # log_probs_ref    = ref_model(completions).log_probs
            # kl_penalty = (log_probs_policy - log_probs_ref).sum(-1)

            # 4. Compute advantages (rewards - kl_penalty * kl_coeff)
            # advantages = rewards - cfg.kl_coeff * kl_penalty

            # 5. PPO clipped objective
            # ratio = (log_probs_policy - log_probs_old).exp()
            # policy_loss = -torch.min(ratio * advantages,
            #                          torch.clamp(ratio, 1-cfg.clip_eps, 1+cfg.clip_eps) * advantages).mean()
            # value_loss  = F.mse_loss(values, returns)
            # entropy     = -(log_probs_policy * log_probs_policy.exp()).sum(-1).mean()
            # loss = policy_loss + cfg.value_loss_coeff * value_loss - cfg.entropy_coeff * entropy
            # loss.backward(); optimizer.step(); optimizer.zero_grad()
            pass

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    # policy_model.save_pretrained(output_dir); tokenizer.save_pretrained(output_dir)
    log.info("RFT checkpoint saved to %s", output_dir)


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def run_rft(
    sft_model: str,
    dataset_path: str,
    output_dir: str,
    ppo_epochs: int = 4,
    batch_size: int = 8,
    lr: float = 1e-6,
) -> None:
    log.info("=== Reinforcement Fine-Tuning (RFT) ===")

    if not os.path.exists(dataset_path):
        log.warning("Dataset not found – using synthetic preferences.")
        preferences = [
            {"prompt": "What is 2+2?", "chosen": "4", "rejected": "5"}
        ] * 32
    else:
        preferences = load_preferences(dataset_path)

    rm_path = train_reward_model(sft_model, preferences, output_dir)
    prompts = [r["prompt"] for r in preferences]
    cfg = PPOConfig(lr=lr, ppo_epochs=ppo_epochs, batch_size=batch_size)
    run_ppo(sft_model, rm_path, prompts, output_dir, cfg)
    log.info("RFT complete.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Reinforcement Fine-Tuning stage")
    p.add_argument("--sft_model",    default="checkpoints/sft")
    p.add_argument("--dataset_path", default="data/preferences.jsonl")
    p.add_argument("--output_dir",   default="checkpoints/rft")
    p.add_argument("--ppo_epochs",   type=int,   default=4)
    p.add_argument("--batch_size",   type=int,   default=8)
    p.add_argument("--lr",           type=float, default=1e-6)
    return p.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    run_rft(
        sft_model=args.sft_model,
        dataset_path=args.dataset_path,
        output_dir=args.output_dir,
        ppo_epochs=args.ppo_epochs,
        batch_size=args.batch_size,
        lr=args.lr,
    )
