import { useLogs } from "../../../data/misc";
import { DataTable, Text } from "../../../components";
import { TaskPanelProps } from "./TaskSelectionWrapper";
import JsonSkeleton from "../../../components/JsonSkeleton";
import Blank from "../../../components/Blank";

export default function TaskLogs({ taskSelection }: TaskPanelProps) {
  const { data: log, isFetching }: { data: any; isFetching: boolean } = useLogs(
    { taskId: taskSelection?.taskResult?.taskId },
  );
  if (!taskSelection) return <Blank />;
  if (!taskSelection.taskResult) return <Blank>Task not executed</Blank>;

  if (isFetching) {
    return <JsonSkeleton />;
  }

  return log && log.length > 0 ? (
    <div style={{ height: "100%", overflowY: "scroll" }}>
      <DataTable
        data={log}
        columns={[
          { name: "createdTime", type: "date", label: "Timestamp" },
          { name: "log", label: "Entry" },
        ]}
        title="Task Logs"
      />
    </div>
  ) : (
    <Text style={{ margin: 15 }} variant="body1">
      No logs available
    </Text>
  );
}
