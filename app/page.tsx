"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabaseClient";
import { Task, DailyNote, ProjectNote } from "@/types";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [projects, setProjects] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: tasksData, error: tasksError } = await supabase
        .from<"tasks", Task>("tasks")
        .select("*");

      const { data: notesData, error: notesError } = await supabase
        .from<"daily_notes", DailyNote>("daily_notes")
        .select("*");

      const { data: projectsData, error: projectsError } = await supabase
        .from<"project_notes", ProjectNote>("project_notes")
        .select("*");

      if (tasksError || notesError || projectsError) {
        console.error("Error fetching data:", tasksError, notesError, projectsError);
      }

      setTasks(tasksData || []);
      setNotes(notesData || []);
      setProjects(projectsData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Tasks Column */}
      <div className="border p-4 rounded-2xl shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks available.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="text-base">
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Daily Notes Column */}
      <div className="border p-4 rounded-2xl shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2">Daily Notes</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500">No daily notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="text-sm">
                {note.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Project Notes Column */}
      <div className="border p-4 rounded-2xl shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-2">Project Notes</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-500">No project notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id}>
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-gray-600">{project.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
