import { FC, useState, useEffect, useMemo, ChangeEvent } from "react";
import { Tabs, Tab, ReactJson, Dropdown, Banner } from "../../components";
import { TabPanel, TabContext } from "@material-ui/lab";
import WorkflowDAG, { TaskResult, TaskCoordinate } from "../../components/diagram/WorkflowDAG";

import TaskSummary from "./TaskSummary";
import TaskLogs from "./TaskLogs";

import { makeStyles } from "@material-ui/styles";
import _ from "lodash";
import TaskPollData from "./TaskPollData";

type RightPanelProps = {
  workflowId: string;
  selectedTask: TaskCoordinate;
  dag?: WorkflowDAG;
  onTaskChange: Function;
}

const useStyles = makeStyles({
  banner: {
    margin: 15,
  },
  dfSelect: {
    padding: 15,
    backgroundColor: "#efefef",
  },
  tabPanel: {
    padding: 0,
    flex: 1,
    overflowY: "auto",
  },
});

const RightPanel: FC< RightPanelProps> = ({ workflowId, selectedTask, dag, onTaskChange }) => {
  const [tabIndex, setTabIndex] = useState("summary");

  const classes = useStyles();

  useEffect(() => {
    setTabIndex("summary"); // Reset to Status Tab on ref change
  }, [selectedTask]);

  const taskResult = useMemo(
    () => dag?.getTaskResultByCoord(selectedTask) as TaskResult,
    [dag, selectedTask]
  );
  const dfOptions = useMemo(
    () => dag?.getDFSiblingsByCoord(selectedTask) as TaskResult[],
    [dag, selectedTask]
  );
  const retryOptions = useMemo(
    () => dag && dag.getTaskResultAttemptsByCoord(selectedTask) as TaskResult[],
    [dag, selectedTask]
  );
  const taskConfig = useMemo(
    () => dag && dag.getTaskConfigByCoord(selectedTask),
    [dag, selectedTask]
  );

  if (!taskResult || !taskConfig) {
    return null;
  }
  return (
    <TabContext value={tabIndex}>
      {dfOptions && (
        <div className={classes.dfSelect}>
          <Dropdown
            onChange={(e: ChangeEvent<{}>, v: any) => {
              onTaskChange({ ref: v.ref });
            }}
            options={dfOptions}
            disableClearable
            value={dfOptions.find(
              (childResult: TaskResult) => childResult.referenceTaskName === taskResult.referenceTaskName
            )}
            getOptionLabel={(childResult: TaskResult) => `${dropdownIcon(childResult.status)} ${childResult.referenceTaskName}`}
            style={{ marginBottom: 20, width: 500 }}
          />
        </div>
      )}

      {Array.isArray(retryOptions) && retryOptions.length >= 1 && (
        <div className={classes.dfSelect}>
          <Dropdown
            label="Retried Task - Select an instance"
            disableClearable
            onChange={(e: ChangeEvent<{}>, v: any) => {
              onTaskChange({
                id: v.taskId,
              });
            }}
            options={retryOptions}
            value={retryOptions.find(
              (opt: TaskResult) => opt.taskId === taskResult.taskId
            )}
            getOptionLabel={(t: TaskResult) =>
              `${dropdownIcon(t.status)} Attempt ${t.retryCount} - ${t.taskId}`
            }
            style={{ marginBottom: 20, width: 500 }}
          />
        </div>
      )}

      <Tabs value={tabIndex} contextual onChange={(e: never, v: string) => setTabIndex(v)}>
        {[
          <Tab label="Summary" value="summary" key="summary" />,
          <Tab
            label="Input"
            disabled={!taskResult.status}
            value="input"
            key="input"
          />,
          <Tab
            label="Output"
            disabled={!taskResult.status}
            value="output"
            key="output"
          />,
          <Tab
            label="Logs"
            disabled={!taskResult.status}
            value="logs"
            key="logs"
          />,
          <Tab
            label="JSON"
            disabled={!taskResult.status}
            value="json"
            key="json"
          />,
          <Tab label="Definition" value="definition" key="definition" />,
          ...(taskConfig.type === "SIMPLE"
            ? [
              <Tab
                label="Poll Data"
                disabled={!taskResult.status}
                value="pollData"
                key="pollData"
              />,
            ]
            : []),
        ]}
      </Tabs>
      <>
        <TabPanel className={classes.tabPanel} value="summary">
          <TaskSummary
            taskResult={taskResult}
            taskConfig={taskConfig}
          />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="input">
          
          {/*taskResult.externalInputPayloadStoragePath ? (
            <Banner className={classes.banner}>
              This task has externalized input. Please reference{" "}
              <code>externalInputPayloadStoragePath</code> for the storage
              location.
            </Banner>
          ) : (
            <ReactJson src={taskResult.inputData} label="Task Input" />
          )*/}
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="output">
          {/*taskResult.externalOutputPayloadStoragePath ? (
            <Banner className={classes.banner}>
              This task has externalized output. Please reference{" "}
              <code>externalOutputPayloadStoragePath</code> for the storage
              location.
            </Banner>
          ) : (
            <ReactJson src={taskResult.outputData} label="Task Output" />
          )*/}
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="pollData">
          <TaskPollData task={taskResult} />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="logs">
          <TaskLogs task={taskResult} />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="json">
          <ReactJson
            src={taskResult}
            label="Unabridged Task Execution Result"
          />
        </TabPanel>
        <TabPanel className={classes.tabPanel} value="definition">
          {/*
            <ReactJson
              src={taskResult.}
              label="Task Definition at Runtime"
            />
            */}
        </TabPanel>
      </>
    </TabContext>
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

export default RightPanel; 