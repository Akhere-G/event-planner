from flask import jsonify
from datetime import date, datetime


def to_camel_case(key: str):
    parts = key.split("_")
    return parts[0] + "".join([p.capitalize() for p in parts[1:]])


def format_json(data):
    if data is None:
        return None
    if isinstance(data, list):
        return [format_json(d) for d in data]
    if isinstance(data, dict):
        return {to_camel_case(k): format_json(v) for k, v in data.items()}
    if isinstance(data, date):
        return data.strftime("%Y-%m-%d")
    if isinstance(data, datetime):
        return data.strftime("%Y-%m-%d %H:%M")
    return data


def api_response(success, data=None, message=None, error=None, status_code=200):
    response = {
        "success": success,
        "message": message,
        "data": format_json(data),
        "error": format_json(error),
    }
    response = {k: v for k, v in response.items() if v is not None}
    return jsonify(response), status_code
