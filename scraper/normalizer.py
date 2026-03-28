"""
Category normalizer — maps raw issuer-specific category strings to canonical values.
Load aliases once at startup with load_aliases(), then call normalize() per scraped row.
"""
from __future__ import annotations
import yaml
from pathlib import Path

_ALIAS_MAP: dict[str, str] = {}
_CANONICAL: frozenset[str] = frozenset()

_DEFAULT_CONFIG = Path(__file__).parent / "categories.yaml"


def load_aliases(path: Path = _DEFAULT_CONFIG) -> None:
    """Load alias -> canonical mapping from categories.yaml. Call once at startup."""
    global _ALIAS_MAP, _CANONICAL
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    _CANONICAL = frozenset(data["canonical"])
    _ALIAS_MAP = {}
    for canonical, aliases in data["aliases"].items():
        for alias in aliases:
            _ALIAS_MAP[_normalize_key(alias)] = canonical

def normalize(raw: str) -> str | None:
    """
    Map a raw issuer category string to a canonical category name.
    Returns None if the string cannot be mapped (caller should log and treat as 'other').
    Case-insensitive; spaces and hyphens treated as underscores.
    """
    if not raw or not raw.strip():
        return None
    key = _normalize_key(raw)
    if key in _ALIAS_MAP:
        return _ALIAS_MAP[key]
    if key in _CANONICAL:
        return key
    return None

def _normalize_key(s: str) -> str:
    return s.strip().lower().replace(" ", "_").replace("-", "_")
