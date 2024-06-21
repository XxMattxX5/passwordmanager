from datetime import datetime
import utils

# Serializer for passwords
def serialize_password(password, timezone):
    return {
        "id": password.id,
        "name": password.account_name,
        "username": password.username,
        "password": password.password,
        "created": utils.convert_to_timezone(password.created_at,timezone).strftime('%Y-%m-%d %H:%M:%S')
    }

# Serializer for folders
def serialize_folder(folder, timezone):
    return {
        "id": folder.id,
        "name": folder.name,
        "created": utils.convert_to_timezone(folder.created_at, timezone).strftime('%Y-%m-%d %H:%M:%S'),
        "accounts": [serialize_password(password, timezone) for password in folder.passwords]
    }