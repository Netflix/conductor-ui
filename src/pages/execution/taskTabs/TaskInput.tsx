import { makeStyles } from "@mui/styles";
import { useWorkflowTaskInput } from "../../../data/execution";
import { Banner, ReactJson } from "../../../components";
import { TaskSelection } from "../TileFactory";

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
});

export default function TaskInput({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data }: { data: any } = useWorkflowTaskInput(
    taskSelection?.workflowId,
    taskSelection?.ref,
    taskSelection?.id
  );
  const classes = useStyles();
  if (!data) return <div>No task selected.</div>;
  return (
    <>
      {data?.externalInputPayloadStoragePath && (
        <Banner className={classes.banner}>
          This task has externalized input. Please reference{" "}
          <code>externalInputPayloadStoragePath</code> for the storage location.
        </Banner>
      )}

      <ReactJson src={data} label="Task Input" path="taskInput" />
    </>
  );
}
