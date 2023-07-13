import React from "react";
import { Paper, NavLink, KeyValueTable } from "../../../components";
import { makeStyles } from "@mui/styles";
import { useAppContext } from "../../../export";

export default function Summary({ execution }) {
  const { customExecutionSummaryRows } = useAppContext();

  // To accommodate unexecuted tasks, read type & name out of workflowTask
  const data = [
    { label: "Workflow ID", value: execution.workflowId },
    { label: "Status", value: execution.status },
    { label: "Version", value: execution.workflowVersion },
    { label: "Start Time", value: execution.startTime, type: "date" },
    { label: "End Time", value: execution.endTime, type: "date" },
    {
      label: "Duration",
      value: execution.endTime - execution.startTime,
      type: "duration",
    },
  ];

  if (execution.parentWorkflowId) {
    data.push({
      label: "Parent Workflow ID",
      value: (
        <NavLink newTab path={`/execution/${execution.parentWorkflowId}`}>
          {execution.parentWorkflowId}
        </NavLink>
      ),
    });
  }

  if (execution.parentWorkflowTaskId) {
    data.push({
      label: "Parent Task ID",
      value: execution.parentWorkflowTaskId,
    });
  }

  if (execution.reasonForIncompletion) {
    data.push({
      label: "Reason for Incompletion",
      value: execution.reasonForIncompletion,
    });
  }

  if (execution.externalInputPayloadStoragePath) {
    data.push({
      label: "Externalized Input",
      value: execution.externalInputPayloadStoragePath,
      type: "externalWorkflowInput",
    });
  }

  if (execution.externalOutputPayloadStoragePath) {
    data.push({
      label: "Externalized Output",
      value: execution.externalOutputPayloadStoragePath,
      type: "externalWorkflowOutput",
    });
  }

  Array.prototype.push.apply(
    data,
    customExecutionSummaryRows.map((row) => ({
      label: row.label,
      value: row.renderer(execution),
    })),
  );

  return <KeyValueTable data={data} />;
}
