using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class DroneController : MonoBehaviour
{
    [Header("Movement")]
    public float maxSpeed = 10f;
    public float steeringForce = 5f;
    public float arriveRadius = 1.5f;

    [Header("Obstacle Avoidance")]
    public float avoidDistance = 8f;
    public float avoidStrength = 30f;
    public float avoidRadius = 0.7f;              // for spherecast
    public LayerMask obstacleMask = ~0;           // which layers are "obstacles"

    [Header("Drone Separation")]
    public float neighborRadius = 4f;
    public float separationStrength = 8f;

    [Header("Altitude / Hover")]
    public bool maintainAltitude = true;
    public float targetAltitude = 5f;
    public float altitudeForce = 20f;      // P gain
    public float altitudeDamping = 5f;     // D gain

    private Rigidbody _rb;
    private Vector3? _targetPos;

    private void Awake()
    {
        _rb = GetComponent<Rigidbody>();
        _rb.useGravity = true;
        // keep quad upright; only yaw
        _rb.constraints = RigidbodyConstraints.FreezeRotationX | RigidbodyConstraints.FreezeRotationZ;
    }

    private void FixedUpdate()
    {
        Vector3 steering = Vector3.zero;

        if (_targetPos.HasValue)
            steering += Seek(_targetPos.Value);

        steering += ObstacleAvoidance();
        steering += Separation();
        steering += AltitudeHold();

        _rb.AddForce(steering, ForceMode.Acceleration);

        // clamp *horizontal* speed
        Vector3 v = _rb.linearVelocity;
        Vector3 horiz = new Vector3(v.x, 0f, v.z);
        if (horiz.magnitude > maxSpeed)
        {
            horiz = horiz.normalized * maxSpeed;
            _rb.linearVelocity = new Vector3(horiz.x, v.y, horiz.z);
        }

        // orientation – only around Y, stay upright
        horiz = new Vector3(_rb.linearVelocity.x, 0f, _rb.linearVelocity.z);

        if (horiz.sqrMagnitude > 0.1f)
        {
            Quaternion targetRot = Quaternion.LookRotation(horiz.normalized, Vector3.up);
            transform.rotation = Quaternion.Lerp(transform.rotation, targetRot, 0.1f);
        }
        else
        {
            Quaternion upright = Quaternion.FromToRotation(transform.up, Vector3.up) * transform.rotation;
            transform.rotation = Quaternion.Lerp(transform.rotation, upright, 0.1f);
        }
    }

    private Vector3 Seek(Vector3 target)
    {
        if (maintainAltitude)
            target.y = transform.position.y;

        Vector3 toTarget = target - transform.position;
        float distance = toTarget.magnitude;

        Vector3 desiredVelocity;
        if (distance < arriveRadius)
            desiredVelocity = toTarget.normalized * Mathf.Lerp(0, maxSpeed, distance / arriveRadius);
        else
            desiredVelocity = toTarget.normalized * maxSpeed;

        return (desiredVelocity - _rb.linearVelocity) * steeringForce;
    }

    private Vector3 ObstacleAvoidance()
    {
        // use current movement direction if we have one, otherwise forward
        Vector3 dir = _rb.linearVelocity.sqrMagnitude > 0.1f
            ? _rb.linearVelocity.normalized
            : transform.forward;

        Ray ray = new Ray(transform.position, dir);

        if (Physics.SphereCast(ray, avoidRadius, out RaycastHit hit, avoidDistance, obstacleMask, QueryTriggerInteraction.Ignore))
        {
            // how "urgent" the avoidance is (closer = stronger)
            float weight = 1f - (hit.distance / avoidDistance);

            // steer along the plane tangent to the obstacle
            Vector3 avoidDir = Vector3.ProjectOnPlane(dir, hit.normal).normalized;

            return avoidDir * avoidStrength * weight;
        }

        return Vector3.zero;
    }

    private Vector3 Separation()
    {
        Vector3 force = Vector3.zero;
        int count = 0;

        Collider[] neighbors = Physics.OverlapSphere(transform.position, neighborRadius);
        foreach (var col in neighbors)
        {
            if (col.attachedRigidbody == null || col.attachedRigidbody == _rb) continue;
            if (!col.GetComponent<DroneController>()) continue;

            Vector3 away = transform.position - col.transform.position;
            float dist = away.magnitude;
            if (dist <= 0.001f) continue;

            force += away.normalized / dist;
            count++;
        }

        if (count > 0)
        {
            force /= count;
            force *= separationStrength;
        }

        return force;
    }

    private Vector3 AltitudeHold()
    {
        if (!maintainAltitude) return Vector3.zero;

        float currentAlt = transform.position.y;
        float error = targetAltitude - currentAlt;

        float verticalVel = Vector3.Dot(_rb.linearVelocity, Vector3.up);
        float upAccel = error * altitudeForce - verticalVel * altitudeDamping;

        return Vector3.up * upAccel;
    }

    public void SetTarget(Vector3 point) => _targetPos = point;
    public void ClearTarget() => _targetPos = null;

    public bool IsNearTarget(float threshold = 1.5f)
    {
        if (!_targetPos.HasValue) return false;
        return Vector3.Distance(transform.position, _targetPos.Value) <= threshold;
    }

    public void FireWeaponAt(Transform target)
    {
        if (!target) return;
        Debug.DrawLine(transform.position, target.position, Color.red, 0.1f);
        Debug.Log($"{name} firing at {target.name}");
    }
}
