const toggles = new Map<string, Set<string>>();

export function resetAthleteTasksForTests() {
  toggles.clear();
}

export function toggleAthleteTask(athleteId: string, taskId: string): {
  taskId: string;
  done: boolean;
} {
  const set = toggles.get(athleteId) ?? new Set<string>();
  if (set.has(taskId)) {
    set.delete(taskId);
    toggles.set(athleteId, set);
    return { taskId, done: false };
  }
  set.add(taskId);
  toggles.set(athleteId, set);
  return { taskId, done: true };
}

export function isTaskDone(athleteId: string, taskId: string): boolean {
  return toggles.get(athleteId)?.has(taskId) === true;
}
