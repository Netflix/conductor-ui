import { ReactJson } from "../../../components";
import Blank from "../../../components/Blank";
import { TaskPanelProps } from "./TaskSelectionWrapper";

export default function TaskExecution({ taskSelection }: TaskPanelProps) {
  if (!taskSelection) {
    return <Blank />;
  }

  return (
    <ReactJson src={taskSelection.taskResult} label="Task Execution JSON" />
  );
}
