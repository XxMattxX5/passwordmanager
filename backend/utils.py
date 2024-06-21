import pytz
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import base64

# Creates a decrytion/encryption key using master password
def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = kdf.derive(password.encode())
    return key

# Encrypts user's stored passwords
def encrypt(password: str, key: bytes) -> str:
    iv = os.urandom(16)  # 16 bytes for AES-CBC
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_password = padder.update(password.encode()) + padder.finalize()
    
    encrypted_password = encryptor.update(padded_password) + encryptor.finalize()
    
    return base64.b64encode(iv + encrypted_password).decode('utf-8')

# Converts stored time to user's timezone
def convert_to_timezone(date, timezone):
    if timezone not in pytz.all_timezones:
        return date

    user_timezone = pytz.timezone(timezone)

    if date.tzinfo is not None:
        local_datetime = date.astimezone(user_timezone)
    else:
        utc_aware_datetime = pytz.utc.localize(date)
        local_datetime = utc_aware_datetime.astimezone(user_timezone)


    return local_datetime
