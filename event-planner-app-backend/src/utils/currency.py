from enum import StrEnum
from typing import Final


class Currency(StrEnum):
    """The currencies the ECB publishes a daily reference rate for."""

    AUD = "AUD"
    BRL = "BRL"
    CAD = "CAD"
    CHF = "CHF"
    CNY = "CNY"
    CZK = "CZK"
    DKK = "DKK"
    EUR = "EUR"
    GBP = "GBP"
    HKD = "HKD"
    HUF = "HUF"
    IDR = "IDR"
    ILS = "ILS"
    INR = "INR"
    ISK = "ISK"
    JPY = "JPY"
    KRW = "KRW"
    MXN = "MXN"
    MYR = "MYR"
    NOK = "NOK"
    NZD = "NZD"
    PHP = "PHP"
    PLN = "PLN"
    RON = "RON"
    SEK = "SEK"
    SGD = "SGD"
    THB = "THB"
    TRY = "TRY"
    USD = "USD"
    ZAR = "ZAR"


BASE_CURRENCY: Final = Currency.GBP
