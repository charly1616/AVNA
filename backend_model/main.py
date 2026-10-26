import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from config import HOST, PORT
from verifier import get_verifier

logger = logging.getLogger("answer-verifier")


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


class VerificationRequest(BaseModel):
    question: str = Field(min_length=1)
    expected_answer: str = Field(min_length=1)
    answer: str = Field(min_length=1)


class VerificationResponse(BaseModel):
    correct: bool
    confidence: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("Loading answer verifier...")
    get_verifier()
    logger.info("Answer verifier ready on %s:%s", HOST, PORT)
    yield
    logger.info("Answer verifier stopped")


app = FastAPI(
    title="Answer Verification Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/verify", response_model=VerificationResponse)
def verify(payload: VerificationRequest) -> VerificationResponse:
    logger.info(
        "Verification request | question=%r | expected=%r | answer=%r",
        payload.question,
        payload.expected_answer,
        payload.answer,
    )

    started_at = time.perf_counter()

    try:
        result = get_verifier().verify(
            question=payload.question,
            expected_answer=payload.expected_answer,
            answer=payload.answer,
        )
    except Exception:
        logger.exception(
            "Verification failed | question=%r | expected=%r | answer=%r",
            payload.question,
            payload.expected_answer,
            payload.answer,
        )
        raise HTTPException(
            status_code=500,
            detail="Answer verification failed.",
        ) from None

    elapsed_ms = (time.perf_counter() - started_at) * 1000

    logger.info(
        "Verification result | correct=%s | confidence=%.4f | duration_ms=%.1f",
        result.correct,
        result.confidence,
        elapsed_ms,
    )

    return VerificationResponse(
        correct=result.correct,
        confidence=result.confidence,
    )


if __name__ == "__main__":
    import uvicorn

    configure_logging()
    uvicorn.run(app, host=HOST, port=PORT)
