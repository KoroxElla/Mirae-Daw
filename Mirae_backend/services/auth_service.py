from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

def verify_token(id_token):
    try:
        logger.debug(f"Verifying token, length: {len(id_token)}")

        # Verify the token
        decoded_token = auth.verify_id_token(id_token)

        logger.debug(f"Token verified successfully for UID: {decoded_token.get('uid')}")
        
        return decoded_token

    except ValueError as e:
        logger.error(f"Invalid token format: {e}")
        raise Exception(f"Invalid token format: {str(e)}")
    except auth.ExpiredIdTokenError:
        logger.error("Token has expired")
        raise Exception("Token has expired")
    except auth.RevokedIdTokenError:
        logger.error("Token has been revoked")
        raise Exception("Token has been revoked")
    except auth.InvalidIdTokenError:
        logger.error("Invalid token")
        raise Exception("Invalid token")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise Exception(f"Token verification failed: {str(e)}")

