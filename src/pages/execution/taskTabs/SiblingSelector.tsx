import { ChangeEvent, useMemo } from "react";
import { makeStyles } from "@mui/styles";
import { Dropdown } from "../../../components";
import WorkflowDAG from "../../../components/diagram/WorkflowDAG";
import { TaskCoordinate } from "../../../types/workflowDef";
import { TaskResult } from "../../../types/execution";

import { ListItem, ListItemText } from "@mui/material";
import _ from "lodash";

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
  dfSelect: {
    marginTop: 12,
  },
});

export default function SiblingSelector({
  selectedTask,
  dag,
  onTaskChange,
}: {
  selectedTask: TaskCoordinate | null;
  dag: WorkflowDAG;
  onTaskChange: (taskSelection: TaskCoordinate) => void;
}) {
  const classes = useStyles();

  const selectedResult = useMemo(() => {
    return selectedTask ? dag.getTaskResultByCoord(selectedTask) : undefined;
  }, [dag, selectedTask]);

  const selectedDFResult = useMemo(() => {
    return selectedResult
      ? dag.getTaskResultByRef(selectedResult.referenceTaskName)
      : undefined;
  }, [dag, selectedResult]);

  const dfSiblings = useMemo(() => {
    return selectedTask ? dag.getDFSiblingsByCoord(selectedTask) : undefined;
  }, [dag, selectedTask]);

  const loopSiblings = useMemo(() => {
    return selectedTask
      ? dag.getLoopTaskSiblingsByCoord(selectedTask)
      : undefined;
  }, [dag, selectedTask]);

  const retries = useMemo(() => {
    return selectedTask ? dag.getTaskResultsByCoord(selectedTask) : undefined;
  }, [dag, selectedTask]);

  if (
    !selectedResult ||
    (!dfSiblings && !loopSiblings && _.size(retries) <= 1)
  ) {
    return null;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        padding: "0px 15px",
        backgroundColor: "#f5f5f5",
      }}
    >
      {dfSiblings && (
        <div className={classes.dfSelect}>
          <Dropdown
            label="Dynamic Fork"
            onChange={(e: ChangeEvent<{}>, v: any) => {
              onTaskChange({ ref: v.referenceTaskName });
            }}
            options={dfSiblings}
            disableClearable
            value={selectedDFResult}
            getOptionLabel={(taskResult) =>
              `${dropdownIcon((taskResult as TaskResult).status)} ${
                (taskResult as TaskResult).referenceTaskName
              }`
            }
            style={{ marginBottom: 20, width: 500 }}
          />
        </div>
      )}

      {loopSiblings && (
        <div className={classes.dfSelect}>
          <Dropdown
            label="Iterations and Retries"
            disableClearable
            onChange={(e: ChangeEvent<{}>, v: any) => {
              console.log(v);
              onTaskChange({
                id: v.taskId,
              });
            }}
            options={loopSiblings}
            value={selectedResult}
            renderOption={(props: any, taskResult: any, state: any) => {
              return (
                <ListItem {...props}>
                  <ListItemText
                    primary={getOptionString(taskResult)}
                    secondary={taskResult.taskId}
                  />
                </ListItem>
              );
            }}
            getOptionLabel={(taskResult) =>
              getOptionString(taskResult as TaskResult)
            }
            style={{ marginBottom: 20, width: 500 }}
            componentsProps={{
              popper: {
                placement: "top-start",
                disablePortal: true,
              },
            }}
          />
        </div>
      )}

      {!loopSiblings && retries && _.size(retries) > 1 && (
        <div className={classes.dfSelect}>
          <Dropdown
            label="Retries"
            disableClearable
            onChange={(e: ChangeEvent<{}>, v: any) => {
              onTaskChange({
                id: v.taskId,
              });
            }}
            options={retries}
            value={selectedResult}
            getOptionLabel={(taskResult) =>
              `${dropdownIcon((taskResult as TaskResult).status)} [Attempt ${
                (taskResult as TaskResult).retryCount! + 1
              }] ${(taskResult as TaskResult).taskId}`
            }
            style={{ marginBottom: 20, width: 500 }}
            componentsProps={{
              popper: {
                placement: "top-start",
                disablePortal: true,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

function dropdownIcon(status: string) {
  let icon;
  switch (status) {
    case "COMPLETED":
      icon = "\u2705";
      break; // Green-checkmark
    case "COMPLETED_WITH_ERRORS":
      icon = "\u2757";
      break; // Exclamation
    case "CANCELED":
      icon = "\uD83D\uDED1";
      break; // stopsign
    case "IN_PROGRESS":
    case "SCHEDULED":
      icon = "\u231B";
      break; // hourglass
    default:
      icon = "\u274C"; // red-X
  }
  return icon + "\u2003";
}

function getOptionString(taskResult: TaskResult) {
  const itrStr =
    taskResult.iteration !== undefined
      ? ` [Iteration ${taskResult.iteration}]`
      : "";
  const attemptStr =
    taskResult.retryCount !== undefined && taskResult.retried
      ? ` [Attempt ${taskResult.retryCount + 1}]`
      : "";
  return `${dropdownIcon(taskResult.status)} ${
    taskResult.referenceTaskName
  }${itrStr}${attemptStr}`;
}
