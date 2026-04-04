from src.config.config import Config
from src import create_app
from src.models import User, Itinerary, ItineraryUser

dev_config = Config().dev_config
app = create_app(config_class=dev_config)

if __name__ == "__main__":
    app.run(host=dev_config.HOST, port=dev_config.PORT, debug=dev_config.DEBUG)
