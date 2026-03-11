import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.models import ErrorResponse, ProcessRequest, ProcessResponse
from app.models_config import GROQ_MODELS
from app.processor import NLPProcessor

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info("Starting Universal NLP Interface API")
    yield
    logger.info("Shutting down Universal NLP Interface API")


# Initialize FastAPI app
app = FastAPI(
    title="Universal NLP Interface API",
    description="Production-ready NLP interface powered by crewAI and Groq",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}s"
    )
    return response


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Universal NLP Interface API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": settings.environment
    }


@app.get("/api/models")
async def list_models():
    """List available Groq models"""
    return {
        "models": [
            {
                "id": model_id,
                "name": config["name"],
                "description": config["description"],
                "max_tokens": config["max_tokens"],
                "supports_reasoning": config["supports_reasoning"],
                "supports_tools": config["supports_tools"],
            }
            for model_id, config in GROQ_MODELS.items()
        ]
    }


@app.post(
    "/api/process",
    response_model=ProcessResponse,
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    }
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def process_text(request: Request, payload: ProcessRequest):
    """
    Process natural language text with automatic intent detection

    - Detects intent (summarization, translation, sentiment, etc.)
    - Routes to appropriate crewAI agent or Groq model
    - Returns processed result with metadata
    """
    try:
        # Create processor with user's API key and selected model
        processor = NLPProcessor(api_key=payload.api_key, model=payload.model)

        # Process the request
        result = await processor.process(
            text=payload.text,
            options=payload.options.model_dump()
        )

        return result

    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "code": f"HTTP_{exc.status_code}"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_ERROR"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development"
    )
