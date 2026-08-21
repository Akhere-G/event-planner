import os


class TestConfig:
    def __init__(self):
        self.ENV = "testing"
        self.DEBUG = True
        self.PORT = os.getenv("FLASK_PORT")
        self.HOST = os.getenv("FLASK_HOST")
        self.TESTING = True
        self.SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
        self.SECRET_KEY = "test-secret-key"
        self.RATELIMIT_ENABLED = False
