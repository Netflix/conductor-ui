import { makeStyles } from "@mui/styles";
import { useWorkflowTaskInput } from "../../../data/execution";
import { Banner, KeyValueTable, ReactJson } from "../../../components";
import { TaskPanelProps } from "./TaskSelectionWrapper";
import Blank from "../../../components/Blank";
import JsonSkeleton from "../../../components/JsonSkeleton";

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
});

export default function TaskInput({ taskSelection }: TaskPanelProps) {
  const { data, isLoading }: { data: any; isLoading: boolean } =
    useWorkflowTaskInput(
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
      {data?.externalInputPayloadStoragePath && (
        <>
          <Banner className={classes.banner}>
            This task has externalized input.
          </Banner>
          <KeyValueTable
            data={[
              {
                label: "Download Link",
                value: data.externalInputPayloadStoragePath,
                type: "externalTaskInput",
              },
            ]}
          />
        </>
      )}

      <ReactJson src={data} label="Task Input" path="taskInput" />
    </>
  );
}
