from src import create_app
import os

app = create_app()

if __name__ == "__main__":
    app.run(
        host=os.getenv("FLASK_HOST"),
        port=os.getenv("FLASK_PORT"),
        debug=os.getenv("FLASK_DEBUG") == "True",
    )
