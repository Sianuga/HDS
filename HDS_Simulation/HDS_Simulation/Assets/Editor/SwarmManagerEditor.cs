#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(SwarmManager))]
public class SwarmManagerEditor : Editor
{
    public override void OnInspectorGUI()
    {
        // Draw default inspector (all public fields)
        base.OnInspectorGUI();

        GUILayout.Space(10);
        GUILayout.Label("Swarm Controls", EditorStyles.boldLabel);

        SwarmManager manager = (SwarmManager)target;

        if (GUILayout.Button("Assign: Basic Fly To Location"))
        {
            manager.AssignBasicFlyToLocation();
        }

        if (GUILayout.Button("Assign: Escort Mission"))
        {
            manager.AssignEscortMission();
        }

        if (GUILayout.Button("Assign: Shooting Squad"))
        {
            manager.AssignShootingSquad();
        }

        if (GUILayout.Button("Assign: Follow Leader"))
        {
            manager.AssignFollowLeader();
        }

        if (GUILayout.Button("Assign: Obstacle Run"))
        {
            manager.AssignObstacleRun();
        }

        GUILayout.Space(5);
        if (Application.isPlaying == false)
        {
            EditorGUILayout.HelpBox("Buttons will work in Play Mode (they call runtime methods).", MessageType.Info);
        }
    }
}
#endif
