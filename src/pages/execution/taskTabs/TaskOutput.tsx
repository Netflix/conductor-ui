import { makeStyles } from "@mui/styles";
import { useWorkflowTaskOutput } from "../../../data/execution";
import { Banner, ReactJson } from "../../../components";
import { TaskSelection } from "../tabLoader";
import Blank from "../../../components/NoTaskSelected";
import JsonSkeleton from "../../../components/JsonSkeleton";

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
  const { data, isLoading }: { data: any; isLoading: boolean } =
    useWorkflowTaskOutput(
      taskSelection?.workflowId,
      taskSelection?.taskResult?.referenceTaskName,
      taskSelection?.taskResult?.taskId
    );
  const classes = useStyles();
  if (!taskSelection) return <Blank />;
  if (!taskSelection.taskResult) return <Blank text="Task not executed" />;
  if (isLoading) return <JsonSkeleton />;

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
