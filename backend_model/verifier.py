import re
import threading
import unicodedata
from dataclasses import dataclass

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from config import (
    DEVICE_NAME,
    ENTAILMENT_LABEL,
    EXACT_MATCH_ENABLED,
    MAX_LENGTH,
    MODEL_NAME,
    THRESHOLD,
)


@dataclass(frozen=True)
class VerificationResult:
    correct: bool
    confidence: float


def normalize_answer(value: str) -> str:
    """Case, accent and punctuation insensitive form used for the fast path."""
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.casefold()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


class AnswerVerifier:
    def __init__(
        self,
        model_name: str = MODEL_NAME,
        device_name: str = DEVICE_NAME,
        max_length: int = MAX_LENGTH,
        threshold: float = THRESHOLD,
        entailment_label: str = ENTAILMENT_LABEL,
        exact_match_enabled: bool = EXACT_MATCH_ENABLED,
    ) -> None:
        self.model_name = model_name
        self.max_length = max_length
        self.threshold = threshold
        self.exact_match_enabled = exact_match_enabled
        self.device = torch.device(device_name)
        self._lock = threading.Lock()

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)

        labels = {
            str(label).strip().lower(): index
            for index, label in self.model.config.id2label.items()
        }

        if entailment_label not in labels:
            raise ValueError(
                f"The model has no '{entailment_label}' label. "
                f"Available labels: {sorted(labels)}"
            )

        self.entailment_index = labels[entailment_label]
        self.contradiction_index = labels.get("contradiction")

        self.model.to(self.device)
        self.model.eval()

    def _class_probabilities(
        self,
        question: str,
        expected_answer: str,
        answer: str,
    ) -> torch.Tensor:
        premise = (
            f"Pregunta: {question}\n"
            f"Respuesta correcta: {expected_answer}"
        )
        hypothesis = f"Respuesta del estudiante: {answer}"

        inputs = self.tokenizer(
            premise,
            hypothesis,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt",
        )
        inputs = {key: value.to(self.device) for key, value in inputs.items()}

        with torch.inference_mode():
            logits = self.model(**inputs).logits
            return torch.softmax(logits, dim=-1)[0]

    def verify(
        self,
        question: str,
        expected_answer: str,
        answer: str,
    ) -> VerificationResult:
        if self.exact_match_enabled and normalize_answer(answer) == normalize_answer(
            expected_answer
        ):
            return VerificationResult(correct=True, confidence=1.0)

        with self._lock:
            probabilities = self._class_probabilities(
                question,
                expected_answer,
                answer,
            )

        entailment = float(probabilities[self.entailment_index].item())
        contradiction = (
            float(probabilities[self.contradiction_index].item())
            if self.contradiction_index is not None
            else 0.0
        )

        correct = entailment >= self.threshold and entailment > contradiction

        return VerificationResult(correct=correct, confidence=entailment)


_verifier: AnswerVerifier | None = None
_verifier_lock = threading.Lock()


def get_verifier() -> AnswerVerifier:
    global _verifier

    if _verifier is None:
        with _verifier_lock:
            if _verifier is None:
                _verifier = AnswerVerifier()

    return _verifier
