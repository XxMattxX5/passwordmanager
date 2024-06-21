import os
from datetime import timedelta



# Configerations for the app
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)