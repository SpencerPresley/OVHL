import string
import hashlib
import secrets
import time
from typing import Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validate_arguments

# Configuration constants
_HASH_CHARS = string.ascii_uppercase + string.digits
_RANDOM_CHARS = string.ascii_uppercase + string.digits
_HASH_LENGTH = 4
_RANDOM_LENGTH = 4
_SEPARATOR = "-"

class Platform(str, Enum):
    PS = "PS"
    XBOX = "XBOX"

class VerificationInput(BaseModel):
    platform: Platform
    gamertag: str = Field(..., min_length=1, max_length=16)
    user_id: str = Field(..., description="User ID from the database")

def _generate_hash_part(input_data: VerificationInput) -> str:
    """Generate deterministic hash part of the code
    
    Args:
        input_data (VerificationInput): VerificationInput instance
        
    Returns:
        str: Hexadecimal hash string
    """
    # Create seed value
    timestamp = time.time()
    seed_parts = [input_data.platform.value, input_data.gamertag, input_data.user_id, str(timestamp)]
    
    seed = ":".join(seed_parts)
    
    # Create hash and extract portion for code
    hash_obj = hashlib.sha256(seed.encode())
    hash_hex = hash_obj.hexdigest()
    
    # Convert hash to desired character set
    hash_value = int(hash_hex[:8], 16)
    hash_part = ""
    
    for _ in range(_HASH_LENGTH):
        hash_value, idx = divmod(hash_value, len(_HASH_CHARS))
        hash_part += _HASH_CHARS[idx]
        
    return hash_part

def _generate_random_part() -> str:
    """Generate random part of the code
    
    Uses secrets module for cryptographic-grade randomization
    
    Returns:
        str: Random string of length _RANDOM_LENGTH
    """
    return "".join(
        secrets.choice(_RANDOM_CHARS)
        for _ in range(_RANDOM_LENGTH)
    )
    
@validate_arguments
def generate_platform_verification_code(input_data: VerificationInput) -> str:
    """Generate verification code for a specific game platform
    
    Args:
        input_data (VerificationInput): VerificationInput instance
        
    Returns:
        A unique verification code
    """
    hash_part = _generate_hash_part(input_data)
    random_part = _generate_random_part()
    return f"{hash_part}{_SEPARATOR}{random_part}"