import { DataTable, TaskLink } from "../../components";
import WorkflowDAG, { TaskCoordinate, TaskResult } from "../../components/diagram/WorkflowDAG";

export default function TaskList({ selectedTask, tasks, dag, workflowId }: { selectedTask: TaskCoordinate, tasks: TaskResult[], dag: WorkflowDAG, workflowId: string }) {
  const taskDetailFields = [
    { name: "seq", grow: 0.2 },
    {
      name: "taskId",
      renderer: (taskId: string) => (
        <TaskLink workflowId={workflowId} taskId={taskId} />
      ),
      grow: 2,
    },
    { name: "taskId", id: "name", renderer: (taskId: string) => dag.getTaskConfigByCoord({ id: taskId })?.name, label: "Task Name" },
    { name: "referenceTaskName", label: "Ref" },
    { name: "taskType", label: "Type", grow: 0.5 },
    { name: "scheduledTime", type: "date-ms" },
    { name: "startTime", type: "date-ms" },
    { name: "endTime", type: "date-ms" },
    { name: "status", grow: 0.8 },
    { name: "updateTime", type: "date-ms" },
    { name: "callbackAfterSeconds" },
    { name: "pollCount", grow: 0.5 },
  ];

  return (
    <DataTable
      style={{ minHeight: 400 }}
      data={tasks}
      columns={taskDetailFields}
      defaultShowColumns={[
        "seq",
        "taskId",
        "taskName",
        "referenceTaskName",
        "taskType",
        "startTime",
        "endTime",
        "status",
      ]}
      localStorageKey="taskListTable"
    />
  );
}
