import os

from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL")


class DevConfig:
    def __init__(self):
        self.ENV = "development"
        self.DEBUG = True
        self.PORT = os.getenv("FLASK_PORT")
        self.HOST = os.getenv("FLASK_HOST")
        self.RATELIMIT_ENABLED = False
        self.SQLALCHEMY_DATABASE_URI = database_url
        self.SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
