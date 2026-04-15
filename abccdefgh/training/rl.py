"""
Scalable Agentic Reinforcement Learning (RL)
=============================================
Stage 4 of the training pipeline.

Trains the model to act as a capable agent in multi-step environments using
scalable RL techniques beyond standard RLHF:

  - Self-play / Constitutional AI  – the model critiques and revises its own
    outputs according to a set of principles, generating synthetic preference
    data without human annotators.
  - Tool-use environment            – the agent is rewarded for correctly
    invoking tools (browser_search, code_interpreter) and producing accurate
    final answers.
  - GRPO (Group Relative Policy Optimisation) – a memory-efficient alternative
    to PPO that normalises rewards within a group of sampled completions,
    removing the need for a separate value-head network.

Dataset format (JSONL)
----------------------
    {
      "prompt":          "Find the population of Tokyo and compute its square root.",
      "ground_truth":    "3706.07",
      "allowed_tools":   ["browser_search", "code_interpreter"]
    }

Usage
-----
    python -m training.rl \\
        --rft_model    checkpoints/rft \\
        --dataset_path data/agentic_tasks.jsonl \\
        --output_dir   checkpoints/rl \\
        --iterations 500 --group_size 8 --lr 5e-7
"""

from __future__ import annotations

import argparse
import json
import logging
import math
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterator

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

def load_tasks(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    log.info("Loaded %d agentic tasks from %s", len(records), path)
    return records


def batch_iter(records: list, batch_size: int) -> Iterator[list]:
    for i in range(0, len(records), batch_size):
        yield records[i : i + batch_size]


# ---------------------------------------------------------------------------
# Reward functions
# ---------------------------------------------------------------------------

def correctness_reward(prediction: str, ground_truth: str) -> float:
    """Binary reward: 1.0 if prediction matches ground truth, else 0.0."""
    return 1.0 if prediction.strip() == ground_truth.strip() else 0.0


def format_reward(response: str) -> float:
    """Partial reward for well-structured responses (tool calls + final answer)."""
    score = 0.0
    if "[TOOL:" in response:
        score += 0.3   # used at least one tool
    if "Answer:" in response or response.strip():
        score += 0.2   # produced a final answer
    return score


def combined_reward(prediction: str, ground_truth: str, response: str) -> float:
    return correctness_reward(prediction, ground_truth) + format_reward(response)


# ---------------------------------------------------------------------------
# Constitutional AI self-critique
# ---------------------------------------------------------------------------

CONSTITUTION = [
    "The response must be factually accurate.",
    "The response must not contain harmful or misleading content.",
    "The response must use tools when external information is needed.",
    "The response must be concise and directly answer the question.",
]


def constitutional_critique(response: str) -> tuple[float, list[str]]:
    """
    Score a response against the constitution and return (score, violations).

    In production this calls the model itself to evaluate each principle.
    Here we use simple heuristics as a stand-in.
    """
    violations: list[str] = []
    score = 1.0

    if len(response) > 4000:
        violations.append("Response is too verbose.")
        score -= 0.1
    if any(w in response.lower() for w in ["i don't know", "i cannot", "i'm not sure", "i do not know"]):
        violations.append("Response is evasive without attempting tool use.")
        score -= 0.2

    return max(0.0, score), violations


# ---------------------------------------------------------------------------
# GRPO (Group Relative Policy Optimisation)
# ---------------------------------------------------------------------------

@dataclass
class GRPOConfig:
    lr: float = 5e-7
    group_size: int = 8          # number of completions sampled per prompt
    kl_coeff: float = 0.01
    clip_eps: float = 0.2
    iterations: int = 500
    max_new_tokens: int = 1024
    constitutional_weight: float = 0.3


def grpo_update(
    rewards: list[float],
    log_probs: list[float],
    ref_log_probs: list[float],
    cfg: GRPOConfig,
) -> float:
    """
    Compute the GRPO loss for one group of completions.

    GRPO normalises rewards within the group (mean/std) so no value network
    is needed.  Returns a scalar loss value (for logging).
    """
    n = len(rewards)
    mean_r = sum(rewards) / n
    std_r  = math.sqrt(sum((r - mean_r) ** 2 for r in rewards) / max(n - 1, 1)) + 1e-8
    advantages = [(r - mean_r) / std_r for r in rewards]

    loss = 0.0
    for adv, lp, ref_lp in zip(advantages, log_probs, ref_log_probs):
        ratio = math.exp(lp - ref_lp)
        clipped = max(1 - cfg.clip_eps, min(1 + cfg.clip_eps, ratio))
        policy_loss = -min(ratio * adv, clipped * adv)
        kl_penalty  = lp - ref_lp          # approximate KL
        loss += policy_loss + cfg.kl_coeff * kl_penalty

    return loss / n


# ---------------------------------------------------------------------------
# Agentic environment
# ---------------------------------------------------------------------------

class AgentEnvironment:
    """
    Simulates a tool-use environment for RL training.

    The agent receives a prompt, may call tools, and produces a final answer.
    The environment scores the answer and returns a reward.
    """

    def __init__(self, allowed_tools: list[str] | None = None) -> None:
        self.allowed_tools = allowed_tools or ["browser_search", "code_interpreter"]

    def step(self, prompt: str, response: str, ground_truth: str) -> float:
        """Return a scalar reward for the agent's response."""
        # Extract the final answer (last non-empty line after tool calls).
        lines = [l.strip() for l in response.split("\n") if l.strip()]
        prediction = lines[-1] if lines else ""

        task_reward = combined_reward(prediction, ground_truth, response)
        const_score, violations = constitutional_critique(response)
        if violations:
            log.debug("Constitutional violations: %s", violations)

        return task_reward + const_score * 0.3


# ---------------------------------------------------------------------------
# Main training loop
# ---------------------------------------------------------------------------

def run_rl(
    rft_model: str,
    dataset_path: str,
    output_dir: str,
    iterations: int = 500,
    group_size: int = 8,
    lr: float = 5e-7,
    constitutional_weight: float = 0.3,
) -> None:
    log.info("=== Scalable Agentic Reinforcement Learning (RL) ===")
    log.info("RFT model   : %s", rft_model)
    log.info("Dataset     : %s", dataset_path)
    log.info("Output dir  : %s", output_dir)
    log.info("Iterations  : %d  |  Group size: %d  |  LR: %g", iterations, group_size, lr)

    cfg = GRPOConfig(
        lr=lr,
        group_size=group_size,
        iterations=iterations,
        constitutional_weight=constitutional_weight,
    )
    env = AgentEnvironment()

    # Load model & tokenizer
    log.info("Loading model from %s …", rft_model)
    # policy_model = AutoModelForCausalLM.from_pretrained(rft_model, torch_dtype=torch.bfloat16)
    # ref_model    = AutoModelForCausalLM.from_pretrained(rft_model, torch_dtype=torch.bfloat16)
    # ref_model.eval(); ref_model.requires_grad_(False)
    # tokenizer    = AutoTokenizer.from_pretrained(rft_model)
    # optimizer    = torch.optim.AdamW(policy_model.parameters(), lr=cfg.lr)

    # Load tasks
    if not os.path.exists(dataset_path):
        log.warning("Dataset not found – using synthetic tasks.")
        tasks = [
            {
                "prompt": "What is the square root of 144?",
                "ground_truth": "12",
                "allowed_tools": ["code_interpreter"],
            }
        ] * 64
    else:
        tasks = load_tasks(dataset_path)

    total_reward = 0.0
    for iteration in range(1, iterations + 1):
        task = tasks[(iteration - 1) % len(tasks)]
        prompt       = task["prompt"]
        ground_truth = task["ground_truth"]

        # Sample `group_size` completions from the policy.
        rewards: list[float] = []
        log_probs: list[float] = []
        ref_log_probs: list[float] = []

        for _ in range(cfg.group_size):
            # completion = policy_model.generate(tokenizer(prompt, ...), max_new_tokens=cfg.max_new_tokens)
            # response   = tokenizer.decode(completion[0])
            response = f"[Simulated response for: {prompt}]"  # stub

            reward = env.step(prompt, response, ground_truth)
            rewards.append(reward)
            log_probs.append(-1.0)      # stub: policy log-prob
            ref_log_probs.append(-1.0)  # stub: reference log-prob

        loss = grpo_update(rewards, log_probs, ref_log_probs, cfg)
        # loss_tensor.backward(); optimizer.step(); optimizer.zero_grad()

        total_reward += sum(rewards) / len(rewards)
        if iteration % 50 == 0:
            avg_reward = total_reward / iteration
            log.info("Iter %4d / %d  |  avg_reward=%.4f  |  loss=%.4f",
                     iteration, iterations, avg_reward, loss)

    # Save final checkpoint
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    # policy_model.save_pretrained(output_dir)
    # tokenizer.save_pretrained(output_dir)
    log.info("RL checkpoint saved to %s", output_dir)
    log.info("Agentic RL complete. Final avg reward: %.4f", total_reward / iterations)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Scalable Agentic RL stage")
    p.add_argument("--rft_model",              default="checkpoints/rft")
    p.add_argument("--dataset_path",           default="data/agentic_tasks.jsonl")
    p.add_argument("--output_dir",             default="checkpoints/rl")
    p.add_argument("--iterations",  type=int,  default=500)
    p.add_argument("--group_size",  type=int,  default=8)
    p.add_argument("--lr",          type=float, default=5e-7)
    p.add_argument("--const_weight", type=float, default=0.3)
    return p.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    run_rl(
        rft_model=args.rft_model,
        dataset_path=args.dataset_path,
        output_dir=args.output_dir,
        iterations=args.iterations,
        group_size=args.group_size,
        lr=args.lr,
        constitutional_weight=args.const_weight,
    )
