import NavLink from "./NavLink";
import rison from "rison";

export type TaskLinkProps = {
  taskId: string;
  workflowId: string;
};

export default function TaskLink({ taskId, workflowId }: TaskLinkProps) {
  const taskObj = rison.encode({
    id: taskId,
  });
  return (
    <NavLink path={`/execution/${workflowId}?task=${taskObj}`}>
      {taskId}
    </NavLink>
  );
}
