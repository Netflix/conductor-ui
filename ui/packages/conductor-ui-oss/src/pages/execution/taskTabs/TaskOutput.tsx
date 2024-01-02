import { makeStyles } from "@mui/styles";
import { useWorkflowTaskOutput } from "../../../data/execution";
import { Banner, KeyValueTable, ReactJson } from "../../../components";
import { TaskPanelProps } from "./TaskSelectionWrapper";
import Blank from "../../../components/Blank";
import JsonSkeleton from "../../../components/JsonSkeleton";

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
});

export default function TaskOutput({ taskSelection }: TaskPanelProps) {
  const { data, isLoading }: { data: any; isLoading: boolean } =
    useWorkflowTaskOutput(
      taskSelection?.workflowId,
      taskSelection?.taskResult?.referenceTaskName,
      taskSelection?.taskResult?.taskId,
    );
  const classes = useStyles();
  if (!taskSelection) return <Blank />;
  if (!taskSelection.taskResult) return <Blank>Task not executed</Blank>;
  if (isLoading) return <JsonSkeleton />;

  return (
    <>
      {data?.externalOutputPayloadStoragePath && (
        <>
          <Banner className={classes.banner}>
            This task has externalized output.
          </Banner>
          <KeyValueTable
            data={[
              {
                label: "Download Link",
                value: data.externalOutputPayloadStoragePath,
                type: "externalTaskOutput",
              },
            ]}
          />
        </>
      )}

      <ReactJson src={data} label="Task Output" path="taskOutput" />
    </>
  );
}
