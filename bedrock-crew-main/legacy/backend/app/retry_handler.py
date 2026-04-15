import asyncio
import logging
from functools import wraps
from typing import Callable, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar('T')


class RetryHandler:
    """Handles retries for transient failures"""

    @staticmethod
    async def retry_with_backoff(
        func: Callable[..., T],
        max_retries: int = 3,
        initial_delay: float = 1.0,
        backoff_factor: float = 2.0,
        exceptions: tuple = (Exception,)
    ) -> T:
        """
        Retry a function with exponential backoff

        Args:
            func: Async function to retry
            max_retries: Maximum number of retry attempts
            initial_delay: Initial delay in seconds
            backoff_factor: Multiplier for delay after each retry
            exceptions: Tuple of exceptions to catch and retry

        Returns:
            Result of the function call

        Raises:
            Last exception if all retries fail
        """
        delay = initial_delay
        last_exception = None

        for attempt in range(max_retries + 1):
            try:
                return await func()
            except exceptions as e:
                last_exception = e

                if attempt == max_retries:
                    logger.error(f"All {max_retries} retry attempts failed: {e}")
                    raise

                logger.warning(
                    f"Attempt {attempt + 1}/{max_retries + 1} failed: {e}. "
                    f"Retrying in {delay}s..."
                )

                await asyncio.sleep(delay)
                delay *= backoff_factor

        raise last_exception


def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """
    Decorator for retrying async functions on failure

    Usage:
        @retry_on_failure(max_retries=3, delay=1.0)
        async def my_function():
            # function code
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await RetryHandler.retry_with_backoff(
                lambda: func(*args, **kwargs),
                max_retries=max_retries,
                initial_delay=delay
            )
        return wrapper
    return decorator
