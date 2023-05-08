import React from "react";
import { KeyValueTable, LinearProgress } from "../../../components";
import { usePollData, useQueueSize } from "../../../data/task";
import _ from "lodash";
import { timestampRenderer } from "../../../utils/helpers";
import { useWorkflowTask } from "../../../data/execution";
import { TaskSelection } from "../TileFactory";

export default function TaskPollData({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data: taskResult }: { data: any } = useWorkflowTask(
    taskSelection?.workflowId,
    taskSelection?.ref,
    taskSelection?.id
  );

  const { data: pollData, isLoading } = usePollData(
    taskSelection?.taskConfig.name
  );
  const { data: queueSize, isLoading: isLoadingQueueSize } = useQueueSize(
    taskSelection?.taskConfig.name,
    taskResult?.domain
  );

  if (!taskSelection || !taskResult) {
    return null;
  }

  const { taskConfig } = taskSelection;

  if (isLoading || isLoadingQueueSize) {
    return <LinearProgress />;
  }

  const pollDataRow = pollData.find((row: any) => {
    if (taskResult.domain) {
      return row.domain === taskResult.domain;
    } else {
      return _.isUndefined(row.domain);
    }
  });

  const data = [
    { label: "Task Name", value: taskConfig.name },
    {
      label: "Domain",
      value: _.defaultTo(taskResult.domain, "(No Domain Set)"),
    },
  ];

  if (pollDataRow) {
    data.push({
      label: "Last Polled By Worker",
      value: pollDataRow.workerId,
    });
    data.push({
      label: "Last Poll Time",
      value: timestampRenderer(pollDataRow.lastPollTime),
    });
  }
  if (queueSize !== undefined) {
    data.push({
      label: "Current Queue Size",
      value: queueSize,
    });
  }

  return <KeyValueTable data={data} />;
}
