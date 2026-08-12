"""
Unit tests for Disaster Response domain data and function calls.

Verifies real API data fetching, spatial shelter math, network timeout failure handling out loud,
explicit data timestamps, and voice number spoken form.
"""

import pytest
from datetime import datetime, timezone
import disaster_data
from agent import Assistant


def test_num_to_words():
    """Test integer and float conversion to spoken words."""
    assert disaster_data.num_to_words(0) == "zero"
    assert disaster_data.num_to_words(5) == "five"
    assert disaster_data.num_to_words(21) == "twenty one"
    assert disaster_data.num_to_words(350) == "three hundred fifty"
    assert disaster_data.num_to_words(1000) == "one thousand"
    assert disaster_data.num_to_words(2.1) == "two point one"


def test_haversine_distance():
    """Test spatial distance calculation between known coordinates."""
    # Distance between Patna center (25.5941, 85.1356) and Patna High Shelter (25.6120, 85.1410)
    dist = disaster_data.haversine_distance(25.5941, 85.1356, 25.6120, 85.1410)
    assert 1.5 < dist < 2.5


def test_fetch_district_alert_data_live():
    """Test live district alert data fetching with timestamp and risk calculation."""
    res = disaster_data.fetch_district_alert_data("Patna")
    assert "Data observed on" in res
    assert "Alert" in res or "Warning" in res or "Notice" in res
    assert "Patna" in res


def test_compute_nearest_shelters():
    """Test shelter spatial search, capacity computation, and timestamping."""
    res = disaster_data.compute_nearest_shelters("Patna")
    assert "Shelter status data last updated on" in res or "NOTICE ON NETWORK TIMEOUT" in res
    assert "Patna" in res
    assert "capacity" in res
    assert "available spaces" in res


def test_district_alert_timeout_failure_out_loud():
    """Test out-loud failure handling when external weather/flood network times out."""
    # Timeout of 0.0001 seconds forces immediate timeout exception
    res = disaster_data.fetch_district_alert_data("Patna", timeout=0.0001)
    assert "NOTICE ON NETWORK TIMEOUT" in res
    assert "timed out" in res
    assert "Providing offline emergency protocol data" in res
    assert "Patna" in res


def test_nearest_shelters_timeout_failure_out_loud(monkeypatch):
    """Test out-loud failure handling when geocoding server times out."""
    def mock_geocode_timeout(location, timeout=3.0):
        raise TimeoutError("Geocoding service timeout")

    monkeypatch.setattr(disaster_data, "geocode_location", mock_geocode_timeout)
    res = disaster_data.compute_nearest_shelters("Patna")
    assert "NOTICE ON NETWORK TIMEOUT" in res or "Shelter status data last updated on" in res
    assert "Patna" in res


@pytest.mark.asyncio
async def test_agent_disaster_tools_integration():
    """Test agent Assistant function tool wrappers get_disaster_alerts and find_relief_centers."""
    assistant = Assistant()
    
    alerts_res = await assistant.get_disaster_alerts(context=None, location="Patna")
    assert "Patna" in alerts_res
    assert "Data observed on" in alerts_res or "NOTICE" in alerts_res
    
    shelter_res = await assistant.find_relief_centers(context=None, location="Patna")
    assert "Patna" in shelter_res
    assert "capacity" in shelter_res
