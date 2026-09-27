from __future__ import annotations

import re
from typing import Optional

STATE_CANONICAL_MAP: dict[str, str] = {
    # Madhya Pradesh
    "mp": "Madhya Pradesh",
    "m.p.": "Madhya Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    # Uttar Pradesh
    "up": "Uttar Pradesh",
    "u.p.": "Uttar Pradesh",
    "uttar pradesh": "Uttar Pradesh",
    # Maharashtra
    "mh": "Maharashtra",
    "maharashtra": "Maharashtra",
    # Karnataka
    "ka": "Karnataka",
    "karnataka": "Karnataka",
    # Tamil Nadu
    "tn": "Tamil Nadu",
    "tamil nadu": "Tamil Nadu",
    "tamilnadu": "Tamil Nadu",
    # Delhi
    "dl": "Delhi",
    "delhi": "Delhi",
    "nct of delhi": "Delhi",
    "national capital territory of delhi": "Delhi",
    "new delhi": "Delhi",
    # Gujarat
    "gj": "Gujarat",
    "gujarat": "Gujarat",
    # Rajasthan
    "rj": "Rajasthan",
    "rajasthan": "Rajasthan",
    # West Bengal
    "wb": "West Bengal",
    "west bengal": "West Bengal",
    # Andhra Pradesh
    "ap": "Andhra Pradesh",
    "andhra pradesh": "Andhra Pradesh",
    # Telangana
    "ts": "Telangana",
    "tg": "Telangana",
    "telangana": "Telangana",
    # Kerala
    "kl": "Kerala",
    "kerala": "Kerala",
    # Punjab
    "pb": "Punjab",
    "punjab": "Punjab",
    # Haryana
    "hr": "Haryana",
    "haryana": "Haryana",
    # Odisha
    "or": "Odisha",
    "od": "Odisha",
    "odisha": "Odisha",
    "orissa": "Odisha",
    # Assam
    "as": "Assam",
    "assam": "Assam",
    # Bihar
    "br": "Bihar",
    "bihar": "Bihar",
    # Chhattisgarh
    "ct": "Chhattisgarh",
    "cg": "Chhattisgarh",
    "chhattisgarh": "Chhattisgarh",
    # Goa
    "ga": "Goa",
    "goa": "Goa",
    # Himachal Pradesh
    "hp": "Himachal Pradesh",
    "himachal pradesh": "Himachal Pradesh",
    # Jharkhand
    "jh": "Jharkhand",
    "jharkhand": "Jharkhand",
    # Uttarakhand
    "ut": "Uttarakhand",
    "uk": "Uttarakhand",
    "uttarakhand": "Uttarakhand",
    "uttaranchal": "Uttarakhand",
    # Jammu and Kashmir
    "jk": "Jammu and Kashmir",
    "jammu & kashmir": "Jammu and Kashmir",
    "jammu and kashmir": "Jammu and Kashmir",
    # Ladakh
    "la": "Ladakh",
    "ladakh": "Ladakh",
    # Puducherry
    "py": "Puducherry",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
    # Chandigarh
    "ch": "Chandigarh",
    "chandigarh": "Chandigarh",
    # Andaman and Nicobar Islands
    "an": "Andaman and Nicobar Islands",
    "andaman and nicobar": "Andaman and Nicobar Islands",
    "andaman and nicobar islands": "Andaman and Nicobar Islands",
    "andaman & nicobar islands": "Andaman and Nicobar Islands",
    # Dadra and Nagar Haveli and Daman and Diu
    "dn": "Dadra and Nagar Haveli and Daman and Diu",
    "dd": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    # Sikkim
    "sk": "Sikkim",
    "sikkim": "Sikkim",
    # Tripura
    "tr": "Tripura",
    "tripura": "Tripura",
    # Meghalaya
    "ml": "Meghalaya",
    "meghalaya": "Meghalaya",
    # Manipur
    "mn": "Manipur",
    "manipur": "Manipur",
    # Mizoram
    "mz": "Mizoram",
    "mizoram": "Mizoram",
    # Nagaland
    "nl": "Nagaland",
    "nagaland": "Nagaland",
    # Arunachal Pradesh
    "ar": "Arunachal Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    # Lakshadweep
    "ld": "Lakshadweep",
    "lakshadweep": "Lakshadweep",
}


def normalize_text(text: Optional[str]) -> str:
    """Strip leading/trailing whitespace and collapse internal whitespace."""
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()


def normalize_state(state: Optional[str]) -> str:
    """Canonicalize Indian state or union territory name."""
    cleaned = normalize_text(state).lower()
    if not cleaned:
        return ""
    if cleaned in STATE_CANONICAL_MAP:
        return STATE_CANONICAL_MAP[cleaned]
    cleaned_no_dots = cleaned.replace(".", "")
    if cleaned_no_dots in STATE_CANONICAL_MAP:
        return STATE_CANONICAL_MAP[cleaned_no_dots]
    return " ".join(word.capitalize() for word in cleaned.split())


def normalize_is_number(is_str: Optional[str]) -> str:
    """Canonicalize Indian Standard number string (e.g., 'is 17803:2022' -> 'IS 17803:2022')."""
    cleaned = normalize_text(is_str)
    if not cleaned:
        return ""
    if re.match(r"^IS/(?:ISO|IEC)", cleaned, re.IGNORECASE):
        return re.sub(r"^IS\s*/\s*ISO\s*", "IS/ISO ", cleaned, flags=re.IGNORECASE)
    match = re.match(r"^IS[\s:-]*(.+)$", cleaned, re.IGNORECASE)
    if match:
        rest = match.group(1).strip()
        return f"IS {rest}"
    return cleaned
