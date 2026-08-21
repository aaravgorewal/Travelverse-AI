import json
import logging
import os
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisCacheService:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        
    async def get(self, key: str) -> Optional[Any]:
        try:
            val = await self.redis.get(key)
            if val:
                return json.loads(val)
            return None
        except Exception as e:
            logger.error(f"Redis GET failed for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl_seconds: int) -> bool:
        try:
            await self.redis.set(key, json.dumps(value), ex=ttl_seconds)
            return True
        except Exception as e:
            logger.error(f"Redis SET failed for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE failed for key {key}: {e}")
            return False
            
    async def clear_prefix(self, prefix: str):
        try:
            keys = await self.redis.keys(f"{prefix}*")
            if keys:
                await self.redis.delete(*keys)
        except Exception as e:
            logger.error(f"Redis CLEAR_PREFIX failed for {prefix}: {e}")
