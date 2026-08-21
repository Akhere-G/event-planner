import os

from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")


class ProductionConfig:
    def __init__(self):
        self.ENV = "production"
        self.DEBUG = False
        self.PORT = os.getenv("FLASK_PORT")
        self.HOST = os.getenv("FLASK_HOST")
        self.SESSION_COOKIE_SECURE = True
        self.SESSION_COOKIE_HTTPONLY = True
        self.SESSION_COOKIE_SAMESITE = "Lax"
        self.RATELIMIT_ENABLED = True
        self.SQLALCHEMY_DATABASE_URI = database_url
        self.SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
