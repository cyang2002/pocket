import pytest
from pathlib import Path
from normalizer import load_aliases, normalize

@pytest.fixture(autouse=True)
def load():
    """Load aliases before each test using the real categories.yaml."""
    load_aliases()

# Alias resolution
def test_alias_restaurants_maps_to_dining():
    assert normalize("restaurants") == "dining"

def test_alias_eating_out_maps_to_dining():
    assert normalize("eating_out") == "dining"

def test_alias_supermarkets_maps_to_groceries():
    assert normalize("supermarkets") == "groceries"

def test_alias_gas_stations_maps_to_gas():
    assert normalize("gas_stations") == "gas"

def test_alias_streaming_services_maps_to_streaming():
    assert normalize("streaming_services") == "streaming"

# Direct canonical match
def test_canonical_dining_maps_to_itself():
    assert normalize("dining") == "dining"

def test_canonical_travel_maps_to_itself():
    assert normalize("travel") == "travel"

def test_canonical_other_maps_to_itself():
    assert normalize("other") == "other"

# Normalization rules
def test_case_insensitive():
    assert normalize("Dining") == "dining"
    assert normalize("RESTAURANTS") == "dining"

def test_spaces_treated_as_underscores():
    assert normalize("gas stations") == "gas"

def test_hyphens_treated_as_underscores():
    assert normalize("gas-stations") == "gas"

# Unmapped
def test_unknown_returns_none():
    assert normalize("completely_unknown_phrase") is None

def test_empty_string_returns_none():
    assert normalize("") is None

def test_whitespace_only_returns_none():
    assert normalize("   ") is None

# All 12 canonical categories are present
def test_all_12_canonical_categories_defined():
    import yaml
    data = yaml.safe_load(
        (Path(__file__).parent.parent / "categories.yaml").read_text()
    )
    expected = {
        "dining", "travel", "groceries", "gas", "streaming", "drugstore",
        "entertainment", "online_shopping", "transit", "home_improvement",
        "business", "other"
    }
    assert set(data["canonical"]) == expected
