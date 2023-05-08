import { makeStyles } from "@mui/styles";
import { useWorkflowTaskOutput } from "../../../data/execution";
import { Banner, ReactJson } from "../../../components";
import { TaskSelection } from "../TileFactory";

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
});

export default function TaskOutput({
  taskSelection,
}: {
  taskSelection?: TaskSelection;
}) {
  const { data }: { data: any } = useWorkflowTaskOutput(
    taskSelection?.workflowId,
    taskSelection?.ref,
    taskSelection?.id
  );
  const classes = useStyles();
  if (!data) return <div>No task selected.</div>;
  return (
    <>
      {data?.externalOutputPayloadStoragePath && (
        <Banner className={classes.banner}>
          This task has externalized output. Please reference{" "}
          <code>externalOutputPayloadStoragePath</code> for the storage
          location.
        </Banner>
      )}

      <ReactJson src={data} label="Task Output" path="taskOutput" />
    </>
  );
}
