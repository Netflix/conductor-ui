import { ReactJson } from "../../../components";
import Blank from "../../../components/NoTaskSelected";
import { TaskSelection } from "../tabLoader";

export default function TaskConfiguration({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  if (!taskSelection) {
    return <Blank />;
  }

  return (
    <ReactJson src={taskSelection.taskConfig} label="Task Configuration" />
  );
}
