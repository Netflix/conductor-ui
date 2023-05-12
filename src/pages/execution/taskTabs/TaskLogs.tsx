import React from "react";
import { useLogs } from "../../../data/misc";
import { DataTable, Text, LinearProgress } from "../../../components";
import { TaskSelection } from "../TileFactory";
import JsonSkeleton from "../../../components/JsonSkeleton";
import NoTaskSelected from "../../../components/NoTaskSelected";

export default function TaskLogs({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data: log, isFetching }: { data: any; isFetching: boolean } = useLogs(
    { taskId: taskSelection?.id }
  );
  if (!taskSelection) {
    return <NoTaskSelected />;
  }

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
