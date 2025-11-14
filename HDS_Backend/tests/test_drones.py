import pytest
from fastapi import status


class TestDroneEndpoints:
    """Tests for /drones endpoints"""

    def test_create_drone(self, client):
        """Test creating a new drone"""
        drone_data = {
            "name": "Test-Drone-01",
            "status": "idle",
            "battery": 100.0
        }
        response = client.post("/drones/", json=drone_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == drone_data["name"]
        assert data["status"] == drone_data["status"]
        assert data["battery"] == drone_data["battery"]
        assert "id" in data
        assert "created_at" in data

    def test_create_drone_duplicate_name(self, client):
        """Test creating drone with duplicate name fails"""
        drone_data = {
            "name": "Duplicate-Drone",
            "status": "idle",
            "battery": 100.0
        }
        # Create first drone
        client.post("/drones/", json=drone_data)

        # Try to create duplicate
        response = client.post("/drones/", json=drone_data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_all_drones_empty(self, client):
        """Test getting drones when database is empty"""
        response = client.get("/drones/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 0
        assert data["drones"] == []

    def test_get_all_drones(self, client):
        """Test getting all drones"""
        # Create test drones
        for i in range(3):
            client.post("/drones/", json={
                "name": f"Drone-{i}",
                "status": "idle",
                "battery": 100.0
            })

        response = client.get("/drones/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 3
        assert len(data["drones"]) == 3

    def test_get_drone_by_id(self, client):
        """Test getting specific drone by ID"""
        # Create drone
        create_response = client.post("/drones/", json={
            "name": "Specific-Drone",
            "status": "idle",
            "battery": 85.5
        })
        drone_id = create_response.json()["id"]

        # Get drone
        response = client.get(f"/drones/{drone_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == drone_id
        assert data["name"] == "Specific-Drone"

    def test_get_drone_not_found(self, client):
        """Test getting non-existent drone returns 404"""
        response = client.get("/drones/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_drone(self, client):
        """Test updating drone information"""
        # Create drone
        create_response = client.post("/drones/", json={
            "name": "Update-Drone",
            "status": "idle",
            "battery": 100.0
        })
        drone_id = create_response.json()["id"]

        # Update drone
        update_data = {
            "status": "active",
            "battery": 75.0
        }
        response = client.put(f"/drones/{drone_id}", json=update_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "active"
        assert data["battery"] == 75.0

    def test_update_drone_not_found(self, client):
        """Test updating non-existent drone returns 404"""
        response = client.put("/drones/999", json={"status": "active"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_drone(self, client):
        """Test deleting a drone"""
        # Create drone
        create_response = client.post("/drones/", json={
            "name": "Delete-Drone",
            "status": "idle",
            "battery": 100.0
        })
        drone_id = create_response.json()["id"]

        # Delete drone
        response = client.delete(f"/drones/{drone_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify deletion
        get_response = client.get(f"/drones/{drone_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_drone_not_found(self, client):
        """Test deleting non-existent drone returns 404"""
        response = client.delete("/drones/999")
        assert response.status_code == status.HTTP_404_NOT_FOUND