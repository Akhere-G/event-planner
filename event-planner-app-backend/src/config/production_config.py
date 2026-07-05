import os
class ProductionConfig:
    def __init__(self):
        self.ENV = "production"
        self.DEBUG = False
        self.PORT = os.getenv("FLASK_PORT")
        self.HOST = os.getenv("FLASK_HOST")
        self.SESSION_COOKIE_SECURE = True
        self.SESSION_COOKIE_HTTPONLY = True
        self.SESSION_COOKIE_SAMESITE = 'Lax'

