import { useRef, useMemo } from "react";
import rison from "rison";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useExecutionAndTasks, useWorkflowDag } from "../../data/execution";
import { TaskCoordinate } from "../../types/workflowDef";
import { Alert, AlertTitle } from "@mui/material";
import { TileFactoryContext } from "./tabLoader";

import "../../components/rc-dock.css";
import DockLayout, {
  LayoutBase,
  LayoutData,
  TabGroup,
  PanelData,
  DockContext,
} from "rc-dock";
import ExecutionHeader from "./ExecutionHeader";
import { useQueryState } from "react-router-use-location-state";
import LinearProgress from "../../components/LinearProgress";
import { DropdownButton } from "../../components";
import { MoreHoriz } from "@mui/icons-material";
import tabLoader from "./tabLoader";
import useLocalStorageState from "use-local-storage-state";
import _ from "lodash";

const defaultLayout: any = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        size: 3,
        tabs: [
          {
            id: "WorkflowGraph",
          },
          {
            id: "WorkflowSummary",
          },
          {
            id: "WorkflowJson",
          },
          {
            id: "TaskList",
          },
          {
            id: "Timeline",
          },
          {
            id: "WorkflowInput",
          },
          {
            id: "WorkflowOutput",
          },
          {
            id: "WorkflowVariables",
          },
        ],
      },
      {
        size: 2,
        tabs: [
          {
            id: "TaskSummary",
          },
          {
            id: "TaskInput",
          },
          {
            id: "TaskOutput",
          },
          {
            id: "TaskPollData",
          },
          {
            id: "TaskLogs",
          },
          {
            id: "TaskConfig",
          },
          {
            id: "TaskExecution",
          },
        ],
      },
    ],
  },
};

export default function Execution() {
  const params = useParams<{ id: string }>();
  const dockRef = useRef<DockLayout>(null);
  const [layout, setLayout] = useLocalStorageState<LayoutBase>(
    "executionLayout",
    {
      defaultValue: defaultLayout,
    },
  );
  const [selectedTaskRison, setSelectedTaskRison] = useQueryState("task", "!n");

  if (!params.id) {
    throw new Error("Missing Execution ID");
  }
  const { executionAndTasks, loading, error } = useExecutionAndTasks(params.id);
  const dag = useWorkflowDag(executionAndTasks);

  const selectedTask: TaskCoordinate | null = useMemo(
    () => (selectedTaskRison ? rison.decode(selectedTaskRison) : null),
    [selectedTaskRison],
  );

  const setSelectedTask = (taskPointer: TaskCoordinate | null) => {
    if (taskPointer?.ref !== "__start" && taskPointer?.ref !== "__end") {
      setSelectedTaskRison(rison.encode(taskPointer));
    }
  };

  const handleSaveLayout = () => {
    const newLayout = dockRef.current!.saveLayout() as any;
    console.log(newLayout);
    setLayout(newLayout);
  };

  const handleRestoreLayout = () => {
    setLayout(defaultLayout);
    dockRef.current!.loadLayout(defaultLayout);
  };

  function panelExtra(panelData: PanelData, context: DockContext) {
    return (
      <>
        <div
          className={
            panelData.parent!.mode === "maximize"
              ? "dock-panel-min-btn"
              : "dock-panel-max-btn"
          }
          onClick={() => context.dockMove(panelData, null, "maximize")}
        ></div>
        <DropdownButton
          size="small"
          icon={<MoreHoriz fontSize="inherit" />}
          options={[
            {
              label: "Save Layout",
              handler: handleSaveLayout,
            },
            {
              label: "Restore Default",
              handler: handleRestoreLayout,
            },
          ]}
        />
      </>
    );
  }

  const groups: { [key: string]: TabGroup } = {
    workflow: {
      animated: false,
      floatable: false,
      maximizable: true,
      panelExtra,
    },
    task: {
      animated: false,
      floatable: false,
      maximizable: true,
      panelExtra,
    },
    siblingSelector: {
      animated: false,
      floatable: "singleTab",
      maximizable: false,
      newWindow: false,
      tabLocked: true,
    },
  };

  return (
    <>
      <Helmet>
        <title>Conductor UI - Execution - {params.id}</title>
      </Helmet>
      {loading && <LinearProgress />}
      {error && <LoadError error={error} />}
      {dag && executionAndTasks && (
        <TileFactoryContext.Provider
          value={{
            executionAndTasks,
            dag,
            selectedTask,
            setSelectedTask,
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ExecutionHeader execution={executionAndTasks.execution} />
            <DockLayout
              ref={dockRef}
              dropMode="edge"
              style={{ width: "100%", height: "100%" }}
              defaultLayout={layout as LayoutData}
              loadTab={tabLoader}
              groups={groups}
            />
          </div>
        </TileFactoryContext.Provider>
      )}
    </>
  );
}

function LoadError({ error }: { error: any }) {
  let retval, title;
  if (_.isString(error.body)) {
    let parsed;
    try {
      parsed = JSON.parse(error.body);
      if (parsed.message) {
        retval = parsed.message;
      } else {
        retval = error.body;
      }
    } catch (e) {
      retval = error.body;
    }
  } else {
    retval = String(error.status);
  }

  title = error.statusText || error.message || error.status;
  return (
    <Alert style={{ margin: 20 }} severity="error">
      <AlertTitle>{title}</AlertTitle>
      {retval}
    </Alert>
  );
}
