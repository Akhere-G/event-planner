from .event_mapper import EventMapper
from .flight_mapper import FlightMapper
from .registry import all_mappers, creation_mapper, get_mapper, register_mapper

register_mapper(EventMapper())
register_mapper(FlightMapper())

__all__ = ["all_mappers", "creation_mapper", "get_mapper", "register_mapper"]
