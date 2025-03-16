from general.token_utils import unmask_user_id
import os

# The masked token you want to test
masked_token = os.getenv("MASKED_TOKEN")

# The expected original user ID
expected_user_id = os.getenv("EXPECTED_USER_ID")

# Try to unmask it
try:
    unmasked_id = unmask_user_id(masked_token)

    if unmasked_id is None:
        print("❌ Failed: Token could not be unmasked (returned None)")
    elif unmasked_id == expected_user_id:
        print("✅ Success! Token unmasked correctly.")
        print(f"Unmasked ID: {unmasked_id}")
    else:
        print("❓ Partial success: Token was unmasked but doesn't match expected ID")
        print(f"Expected: {expected_user_id}")
        print(f"Received: {unmasked_id}")
except Exception as e:
    print(f"❌ Error during unmasking: {e}")
