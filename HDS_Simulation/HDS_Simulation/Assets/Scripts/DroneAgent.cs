using UnityEngine;

[RequireComponent(typeof(DroneController))]
public class DroneAgent : MonoBehaviour
{
    public DroneMissionType missionType = DroneMissionType.None;

    [Header("Common Mission Targets")]
    public Transform missionTarget;      // point to fly to / enemy to shoot
    public Transform leader;            // for escort / follow leader
    public Vector3 formationOffset;     // local offset around leader/target

    [Header("Obstacle Run")]
    public Transform[] obstacleWaypoints;
    public float waypointReachRadius = 2f;
    private int _currentWaypointIndex = 0;

    private DroneController _controller;

    private void Awake()
    {
        _controller = GetComponent<DroneController>();
    }

    private void Update()
    {
        if (missionType == DroneMissionType.None)
        {
            _controller.ClearTarget();
            return; // do nothing until SwarmManager assigns a mission
        }

        switch (missionType)
        {
            case DroneMissionType.FlyToLocation: HandleFlyToLocation(); break;
            case DroneMissionType.Escort: HandleEscort(); break;
            case DroneMissionType.ShootingSquad: HandleShootingSquad(); break;
            case DroneMissionType.FollowLeader: HandleFollowLeader(); break;
            case DroneMissionType.ObstacleRun: HandleObstacleRun(); break;
        }
    }


    private void HandleFlyToLocation()
    {
        if (missionTarget == null) return;

        Vector3 center = missionTarget.position;
        Vector3 targetPos = center + formationOffset; 
        _controller.SetTarget(targetPos);
    }

    private void HandleEscort()
    {
        if (leader == null) return;

        Vector3 targetPos = leader.position + leader.TransformDirection(formationOffset);
        _controller.SetTarget(targetPos);
    }

    private void HandleFollowLeader()
    {
        if (leader == null) return;

        Vector3 targetPos = leader.position + leader.TransformDirection(formationOffset);
        _controller.SetTarget(targetPos);
    }

    private void HandleShootingSquad()
    {
        if (missionTarget == null) return;

        // Drone moves to firing position around the target
        Vector3 targetPos = missionTarget.position + missionTarget.TransformDirection(formationOffset);
        _controller.SetTarget(targetPos);

        float distance = Vector3.Distance(transform.position, missionTarget.position);
        float fireRange = 15f;

        if (distance < fireRange)
        {
            _controller.FireWeaponAt(missionTarget);
        }
    }

    private void HandleObstacleRun()
    {
        if (obstacleWaypoints == null || obstacleWaypoints.Length == 0) return;

        Transform wp = obstacleWaypoints[_currentWaypointIndex];
        _controller.SetTarget(wp.position);

        float dist = Vector3.Distance(transform.position, wp.position);
        if (dist < waypointReachRadius)
        {
            _currentWaypointIndex = (_currentWaypointIndex + 1) % obstacleWaypoints.Length;
        }
    }

    // --- Helpers used by SwarmManager ---

    public void SetObstaclePath(Transform[] waypoints)
    {
        obstacleWaypoints = waypoints;
        _currentWaypointIndex = 0;
    }

    public void SetLeader(Transform newLeader, Vector3 offset)
    {
        leader = newLeader;
        formationOffset = offset;
    }

    public void SetMissionTarget(Transform target)
    {
        missionTarget = target;
    }

    public void SetMission(DroneMissionType type)
    {
        missionType = type;
    }
}
