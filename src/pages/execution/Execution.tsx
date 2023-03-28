import { useMemo, useState, useEffect, useCallback } from "react";
import { useQueryState } from "react-router-use-location-state";
import Alert from "@material-ui/lab/Alert";
import {
  Tabs,
  Tab,
  NavLink,
  SecondaryButton,
  LinearProgress,
  Heading,
  StatusBadge
} from "../../components";

import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useRouteMatch } from "react-router-dom";
import TaskDetails from "./TaskDetails";
import ExecutionSummary from "./ExecutionSummary";
import ExecutionJson from "./ExecutionJson";
import InputOutput from "./ExecutionInputOutput";
import clsx from "clsx";
import ActionModule from "./ActionModule";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import RightPanel from "./RightPanel";
import { Helmet } from "react-helmet";
import sharedStyles from "../styles";
import rison from "rison";
import { useExecutionAndTasks, useWorkflowDag } from "../../data/execution";
import { TaskCoordinate } from "../../components/diagram/WorkflowDAG";
import { useWhatChanged } from '@simbathesailor/use-what-changed';
const maxWindowWidth = window.innerWidth;
const INIT_DRAWER_WIDTH = 650;

const useStyles = makeStyles({
  header: sharedStyles.header,
  drawer: {
    zIndex: 999,
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: (state: any) => (state.isFullWidth ? "100%" : state.drawerWidth),
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: 10,
    justifyContent: "flex-end",
    height: 80,
    flexShrink: 0,
    boxShadow: "0 4px 8px 0 rgb(0 0 0 / 10%), 0 0 2px 0 rgb(0 0 0 / 10%)",
    zIndex: 1,
    backgroundColor: "#fff",
  },
  dragger: {
    display: (state) => (state.isFullWidth ? "none" : "block"),
    width: "5px",
    cursor: "ew-resize",
    padding: "4px 0 0",
    position: "absolute",
    height: "100%",
    zIndex: 100,
    backgroundColor: "#f4f7f9",
  },
  drawerMain: {
    paddingLeft: (state) => (state.isFullWidth ? 0 : 4),
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  contentShift: {
    marginRight: (state) => state.drawerWidth,
  },
  tabContent: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  headerSubtitle: {
    marginBottom: 20,
  },
  fr: {
    display: "flex",
    position: "relative",
    float: "right",
    marginRight: 50,
    marginTop: 10,
    zIndex: 1,
  },
  frItem: {
    display: "flex",
    alignItems: "center",
    marginRight: 15,
  },
  rightPanel: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

type RouteParams = {
  id: string
}

export default function Execution() {
  const match = useRouteMatch<RouteParams>();
/*
  const {
    data: executionWithoutTasks,
    isFetching: isFetchingExecution,
    refetch: refetchExecutions,
  } = useWorkflow(match.params.id);
  
  const { 
    data: tasks, 
    isFetching: isFetchingTasks, 
    refetch: refetchTasks 
  } = useWorkflowTasksBackfill(match.params.id);
*/
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(INIT_DRAWER_WIDTH);

  const [tabIndex, setTabIndex] = useQueryState("tabIndex", 0);
  const [selectedTaskRison, setSelectedTaskRison] = useQueryState("task", "");

  //const isFetching = useMemo(() => isFetchingExecution || isFetchingTasks, [isFetchingExecution, isFetchingTasks]);
  /*
  const execution = useMemo(() => {
    if(executionWithoutTasks && tasks){
      return {
        ...executionWithoutTasks,
        tasks
      }
    }
  }, [executionWithoutTasks, tasks]);
*/
  const isFetching = false;
  const executionAndTasks = useExecutionAndTasks(match.params.id);
  const dag = useWorkflowDag(executionAndTasks);


  const execution = executionAndTasks?.execution;
  const tasks = executionAndTasks?.tasks;

  const selectedTask: TaskCoordinate | undefined = useMemo(
    () => selectedTaskRison ? rison.decode(selectedTaskRison): undefined,
    [selectedTaskRison]
  );

  const setSelectedTask = (taskPointer: TaskCoordinate) => {
    setSelectedTaskRison(rison.encode(taskPointer));
  };

  const classes = useStyles({
    isFullWidth,
    drawerWidth,
  });

  const handleMousemove = useCallback(
    (e:MouseEvent) => {
      // we don't want to do anything if we aren't resizing.
      if (!isResizing) {
        return;
      }

      // Stop highlighting
      e.preventDefault();
      const offsetRight =
        document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
      const minWidth = 0;
      const maxWidth = maxWindowWidth - 100;
      if (offsetRight > minWidth && offsetRight < maxWidth) {
        setDrawerWidth(offsetRight);
      }
    },
    [isResizing]
  );

  const refresh = () => {
//    refetchExecutions();
    //refetchTasks();
  }


  const handleMousedown = (e: React.MouseEvent) => setIsResizing(true);

  const handleClose = () => {
    setSelectedTaskRison(null);
  };

  const handleFullScreen = () => {
    setIsFullWidth(true);
  };

  const handleFullScreenExit = () => {
    setIsFullWidth(false);
  };

  // On load and destroy only
  useEffect(() => {
    const mouseUp = (e: Event) => setIsResizing(false);

    document.addEventListener("mousemove", handleMousemove);
    document.addEventListener("mouseup", mouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMousemove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [handleMousemove]);

  const ready = !!execution && !!dag;

  return (
    <>
      <Helmet>
        <title>Conductor UI - Execution - {match.params.id}</title>
      </Helmet>
      <div
        className={clsx(classes.content, {
          [classes.contentShift]: !!selectedTask,
        })}
      >
        {isFetching && <LinearProgress />}
        {ready && (
          <>
            <div className={classes.header}>
              <div className={classes.fr}>
                {execution.parentWorkflowId && (
                  <div className={classes.frItem}>
                    <NavLink
                      newTab
                      path={`/execution/${execution.parentWorkflowId}`}
                    >
                      Parent Workflow
                    </NavLink>
                  </div>
                )}
                <div className={classes.frItem}>
                  <NavLink
                    newTab
                    path={`/workflowDef/${execution.workflowName}`}
                  >
                    Definition
                  </NavLink>
                </div>
                <SecondaryButton onClick={refresh} style={{ marginRight: 10 }}>
                  Refresh
                </SecondaryButton>
                <ActionModule execution={execution} triggerReload={refresh} />
              </div>
              <Heading level={3} gutterBottom>
                {execution.workflowName}{" "}
                <StatusBadge status={execution.status} />
              </Heading>
              <Heading level={0} className={classes.headerSubtitle}>
                {execution.workflowId}
              </Heading>

              {execution.reasonForIncompletion && (
                <Alert severity="error">
                  {execution.reasonForIncompletion}
                </Alert>
              )}

              <Tabs value={tabIndex} style={{ marginBottom: 0 }}>
                <Tab label="Tasks" onClick={() => setTabIndex(0)} />
                <Tab label="Summary" onClick={() => setTabIndex(1)} />
                <Tab
                  label="Workflow Input/Output"
                  onClick={() => setTabIndex(2)}
                />
                <Tab label="JSON" onClick={() => setTabIndex(3)} />
              </Tabs>
            </div>
            <div className={classes.tabContent}>
              {tabIndex === 0 && (
                <TaskDetails
                  dag={dag}
                  execution={execution}
                  tasks={tasks}
                  setSelectedTask={setSelectedTask}
                  selectedTask={selectedTask}
                />
              )}
              {tabIndex === 1 && <ExecutionSummary execution={execution} />}
              {tabIndex === 2 && <InputOutput execution={execution} />}
              {tabIndex === 3 && <ExecutionJson execution={execution} />}
            </div>
          </>
        )}
      </div>
      {selectedTask && ready && (
        <div className={classes.drawer}>
          <div
            id="dragger"
            onMouseDown={(event) => handleMousedown(event)}
            className={classes.dragger}
          />
          <div className={classes.drawerMain}>
            <div className={classes.drawerHeader}>
              {isFullWidth ? (
                <Tooltip title="Restore sidebar">
                  <IconButton onClick={() => handleFullScreenExit()}>
                    <FullscreenExitIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Maximize sidebar">
                  <IconButton onClick={() => handleFullScreen()}>
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Close sidebar">
                <IconButton onClick={() => handleClose()}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </div>
            <div className={classes.drawerContent}>
              <RightPanel
                workflowId={execution.workflowId}
                selectedTask={selectedTask}
                dag={dag}
                onTaskChange={setSelectedTask}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
