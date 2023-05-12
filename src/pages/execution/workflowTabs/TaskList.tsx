import { ReactJson } from "../../../components";
import { TaskResult } from "../../../types/execution";

export default function TaskList({
  tasks,
  workflowId,
}: {
  tasks: TaskResult[];
  workflowId: string;
}) {
  /*
  const taskDetailFields = [
    { name: "seq", grow: 0.2 },
    {
      name: "taskId",
      renderer: (taskId: string) => (
        <TaskLink workflowId={workflowId} taskId={taskId} />
      ),
      grow: 2,
    },
    { name: "taskDefName", label: "Task Name" },
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
  */
  return (
    <ReactJson
      src={tasks}
      label="Executed tasks (Table WIP)"
      path="tasks.json"
    />
    /*
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
    */
  );
}
