from datetime import datetime
import utils

# Serializer for passwords
def serialize_password(password):
    return {
        "id": password.id,
        "name": password.account_name,
        "username": password.username,
        "password": password.password,
        "created": password.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

# Serializer for folders
def serialize_folder(folder):
    return {
        "id": folder.id,
        "name": folder.name,
        "created": folder.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "accounts": [serialize_password(password) for password in folder.passwords]
    }
