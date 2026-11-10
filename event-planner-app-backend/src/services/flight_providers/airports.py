from ..airport_directory import AirportInfo, get_airport_info


def require_airport(code: str) -> AirportInfo:
    airport = get_airport_info(code)
    if airport is None:
        raise ValueError(f"Unknown airport {code}.")
    return airport
