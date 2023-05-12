import { makeStyles } from "@mui/styles";
import { useWorkflowTaskInput } from "../../../data/execution";
import { Banner, ReactJson } from "../../../components";
import { TaskSelection } from "../TileFactory";
import NoTaskSelected from "../../../components/NoTaskSelected";
import JsonSkeleton from "../../../components/JsonSkeleton";

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
  const { data, isLoading }: { data: any; isLoading: boolean } =
    useWorkflowTaskInput(
      taskSelection?.workflowId,
      taskSelection?.ref,
      taskSelection?.id
    );
  const classes = useStyles();
  if (!taskSelection) return <NoTaskSelected />;
  if (isLoading) return <JsonSkeleton />;

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
