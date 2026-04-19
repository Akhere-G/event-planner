from src.config.config import Config
from src import create_app
from flask import send_from_directory


dev_config = Config().dev_config
app = create_app(config_class=dev_config)


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(host=dev_config.HOST, port=dev_config.PORT, debug=dev_config.DEBUG)
