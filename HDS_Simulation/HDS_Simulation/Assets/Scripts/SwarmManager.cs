using System.Collections.Generic;
using UnityEngine;

public class SwarmManager : MonoBehaviour
{
    [Header("Drones")]
    public List<DroneAgent> drones = new List<DroneAgent>();

    [Header("Common Targets")]
    public Transform flyToLocationTarget;   // basic "fly here"
    public Transform escortTarget;          // object to escort
    public Transform shootingTarget;        // target to shoot
    public Transform leaderDrone;           // leader for follow leader

    [Header("Obstacle Run Path")]
    public Transform[] obstacleWaypoints;

    [Header("Formation Settings")]
    public float formationSpacing = 3f;
    public int formationCols = 3;

    private void Awake()
    {
        // Auto-fill list if it's empty
        if (drones.Count == 0)
        {
            drones.AddRange(FindObjectsOfType<DroneAgent>());
            Debug.Log($"SwarmManager: auto-registered {drones.Count} drones.");
        }
    }

    private void Start()
    {
        // You can call one of these in Start() or from UI buttons:
        //AssignBasicFlyToLocation();
        //AssignEscortMission();
        //AssignShootingSquad();
        //AssignFollowLeader();
        //AssignObstacleRun();
    }

    // --- Mission assignment methods ---

    public void AssignBasicFlyToLocation()
    {
        if (flyToLocationTarget == null)
        {
            Debug.LogWarning("SwarmManager: flyToLocationTarget not set.");
            return;
        }

        for (int i = 0; i < drones.Count; i++)
        {
            DroneAgent d = drones[i];
            if (d == null) continue;

            d.SetMission(DroneMissionType.FlyToLocation);
            d.SetMissionTarget(flyToLocationTarget);
            d.formationOffset = GetFormationOffset(i);
        }
    }

    public void AssignEscortMission()
    {
        if (escortTarget == null)
        {
            Debug.LogWarning("SwarmManager: escortTarget not set.");
            return;
        }

        for (int i = 0; i < drones.Count; i++)
        {
            DroneAgent d = drones[i];
            if (d == null) continue;

            d.SetMission(DroneMissionType.Escort);
            d.leader = escortTarget;
            d.formationOffset = GetFormationOffset(i);
        }
    }

    public void AssignShootingSquad()
    {
        if (shootingTarget == null)
        {
            Debug.LogWarning("SwarmManager: shootingTarget not set.");
            return;
        }

        for (int i = 0; i < drones.Count; i++)
        {
            DroneAgent d = drones[i];
            if (d == null) continue;

            d.SetMission(DroneMissionType.ShootingSquad);
            d.SetMissionTarget(shootingTarget);
            d.formationOffset = GetFormationOffset(i);
        }
    }

    public void AssignFollowLeader()
    {
        if (leaderDrone == null)
        {
            Debug.LogWarning("SwarmManager: leaderDrone not set.");
            return;
        }

        for (int i = 0; i < drones.Count; i++)
        {
            DroneAgent d = drones[i];
            if (d == null) continue;

            d.SetMission(DroneMissionType.FollowLeader);
            d.SetLeader(leaderDrone, GetFormationOffset(i));
        }
    }

    public void AssignObstacleRun()
    {
        if (obstacleWaypoints == null || obstacleWaypoints.Length == 0)
        {
            Debug.LogWarning("SwarmManager: obstacleWaypoints not set.");
            return;
        }

        foreach (var d in drones)
        {
            if (d == null) continue;

            d.SetMission(DroneMissionType.ObstacleRun);
            d.SetObstaclePath(obstacleWaypoints);
        }
    }

    // --- Simple grid formation helper ---

    private Vector3 GetFormationOffset(int index)
    {
        int row = index / formationCols;
        int col = index % formationCols;

        float x = (col - (formationCols - 1) / 2f) * formationSpacing;
        float z = -row * formationSpacing;

        // formation in front of leader/target
        return new Vector3(x, 0f, z);
    }
}
