import os
class DevConfig:
    def __init__(self):
        self.ENV = "development"
        self.DEBUG = True
        self.PORT = os.getenv("FLASK_PORT")
        self.HOST = os.getenv("FLASK_HOST")
