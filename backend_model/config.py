import os

import torch
from dotenv import load_dotenv

load_dotenv()

DEFAULT_PORT = 8000

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", str(DEFAULT_PORT)))

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli",
)
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "512"))
THRESHOLD = float(os.getenv("THRESHOLD", "0.50"))
ENTAILMENT_LABEL = os.getenv("ENTAILMENT_LABEL", "entailment")

EXACT_MATCH_ENABLED = os.getenv("EXACT_MATCH_ENABLED", "true").lower() in (
    "1",
    "true",
    "yes",
)

DEVICE_NAME = os.getenv(
    "DEVICE",
    "cuda" if torch.cuda.is_available() else "cpu",
)
