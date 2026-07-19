from __future__ import annotations
 
import time
from typing import Any, Callable
 
_store: dict[str, tuple[float, Any]] = {}
 
 
def cached(key: str, ttl_seconds: float, fn: Callable[[], Any]) -> Any:
    now = time.time()
    hit = _store.get(key)
    if hit is not None and (now - hit[0]) < ttl_seconds:
        return hit[1]
    value = fn()
    _store[key] = (now, value)
    return value