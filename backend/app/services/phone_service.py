import phonenumbers
from phonenumbers import geocoder, carrier, timezone as ph_tz
from typing import Dict, Any

def lookup_phone(number_str: str) -> Dict[str, Any]:
    try:
        parsed = phonenumbers.parse(number_str, None)
    except phonenumbers.phonenumberutil.NumberParseException as e:
        raise ValueError(f"Invalid phone number: {e}")

    is_valid = phonenumbers.is_valid_number(parsed)
    is_possible = phonenumbers.is_possible_number(parsed)

    number_type_map = {
        phonenumbers.PhoneNumberType.MOBILE: "Mobile",
        phonenumbers.PhoneNumberType.FIXED_LINE: "Fixed Line",
        phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed/Mobile",
        phonenumbers.PhoneNumberType.TOLL_FREE: "Toll Free",
        phonenumbers.PhoneNumberType.PREMIUM_RATE: "Premium Rate",
        phonenumbers.PhoneNumberType.VOIP: "VoIP",
        phonenumbers.PhoneNumberType.UNKNOWN: "Unknown",
    }
    num_type = number_type_map.get(phonenumbers.number_type(parsed), "Unknown")

    country_code = phonenumbers.region_code_for_number(parsed)
    carrier_name = carrier.name_for_number(parsed, "en") or ""
    timezones = list(ph_tz.time_zones_for_number(parsed))
    geo = geocoder.description_for_number(parsed, "en")

    return {
        "input": number_str,
        "international_format": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
        "national_format": phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL),
        "country": geo or country_code,
        "country_code": f"+{parsed.country_code}",
        "carrier": carrier_name,
        "timezone": timezones,
        "number_type": num_type,
        "is_valid": is_valid,
        "is_possible": is_possible,
    }
