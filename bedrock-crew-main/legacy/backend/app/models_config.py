"""Groq model configurations"""

GROQ_MODELS = {
    "openai/gpt-oss-120b": {
        "name": "GPT OSS 120B",
        "description": "Most powerful model with reasoning and tools support",
        "max_tokens": 65536,
        "supports_reasoning": True,
        "supports_tools": True,
        "default_temperature": 1.0,
    },
    "llama-3.3-70b-versatile": {
        "name": "Llama 3.3 70B Versatile",
        "description": "Most versatile model for complex tasks",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
        "default_temperature": 1.0,
    },
    "llama-3.1-70b-versatile": {
        "name": "Llama 3.1 70B Versatile",
        "description": "High performance model with large context",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
        "default_temperature": 1.0,
    },
    "llama-3.1-8b-instant": {
        "name": "Llama 3.1 8B Instant",
        "description": "Extremely fast for simple tasks",
        "max_tokens": 8192,
        "supports_reasoning": False,
        "supports_tools": False,
        "default_temperature": 1.0,
    },
    "mixtral-8x7b-32768": {
        "name": "Mixtral 8x7B",
        "description": "High-quality Mixture of Experts model",
        "max_tokens": 32768,
        "supports_reasoning": False,
        "supports_tools": False,
        "default_temperature": 0.7,
    },
    "gemma2-9b-it": {
        "name": "Gemma 2 9B IT",
        "description": "Efficient and high-quality model from Google",
        "max_tokens": 8192,
        "supports_reasoning": False,
        "supports_tools": False,
        "default_temperature": 1.0,
    },
}

DEFAULT_MODEL = "llama-3.3-70b-versatile"


def get_model_config(model_name: str):
    """Get configuration for a specific model"""
    return GROQ_MODELS.get(model_name, GROQ_MODELS[DEFAULT_MODEL])


def is_valid_model(model_name: str) -> bool:
    """Check if model is supported"""
    return model_name in GROQ_MODELS
