import React from "react";
import { ReactJson } from "../../../components";
import Blank from "../../../components/NoTaskSelected";
import { TaskSelection } from "../tabLoader";

export default function TaskExecution({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  if (!taskSelection) {
    return <Blank />;
  }

  return (
    <ReactJson src={taskSelection.taskResult} label="Task Execution JSON" />
  );
}
