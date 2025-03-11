import base64
import hmac
import hashlib
import time
import os
from typing import Optional

# Secret key for user ID masking (in production, load from environment variable)
# _USER_ID_SECRET = os.environ.get("USER_ID_SECRET", "your-secret-key-for-user-id-masking")
SECRET_KEY = os.getenv("SECRET_KEY")

def unmask_user_id(masked_id: str, max_age_seconds: int = 3600) -> Optional[str]:
    """
    Decode a masked user_id back to the original ID
    
    Args:
        masked_id: The masked user ID
        max_age_seconds: Maximum age of the token in seconds
        
    Returns:
        The original user ID or None if invalid/expired
    """
    try:
        # Decode from base64
        decoded = base64.urlsafe_b64decode(masked_id.encode('utf-8'))
        
        # Extract signature and data
        signature, data = decoded[:10], decoded[10:]
        
        # Split data
        data_str = data.decode('utf-8')
        user_id, timestamp_str = data_str.split(':')
        
        # Verify timestamp isn't too old
        timestamp = int(timestamp_str)
        current_time = int(time.time())
        
        if current_time - timestamp > max_age_seconds:
            # Token is expired
            return None
            
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            data,
            digestmod=hashlib.sha256
        ).digest()[:10]
        
        if not hmac.compare_digest(signature, expected_sig):
            # Invalid signature
            return None
            
        return user_id
        
    except Exception:
        # Any error in decoding/processing should return None
        return None 