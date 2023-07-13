import React from "react";
import { useLogs } from "../../../data/misc";
import { DataTable, Text } from "../../../components";
import { TaskSelection } from "../tabLoader";
import JsonSkeleton from "../../../components/JsonSkeleton";
import Blank from "../../../components/NoTaskSelected";

export default function TaskLogs({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data: log, isFetching }: { data: any; isFetching: boolean } = useLogs(
    { taskId: taskSelection?.taskResult?.taskId },
  );
  if (!taskSelection) return <Blank />;
  if (!taskSelection.taskResult) return <Blank text="Task not executed" />;

  if (isFetching) {
    return <JsonSkeleton />;
  }

  return log && log.length > 0 ? (
    <DataTable
      data={log}
      columns={[
        { name: "createdTime", type: "date", label: "Timestamp" },
        { name: "log", label: "Entry" },
      ]}
      title="Task Logs"
    />
  ) : (
    <Text style={{ margin: 15 }} variant="body1">
      No logs available
    </Text>
  );
}
