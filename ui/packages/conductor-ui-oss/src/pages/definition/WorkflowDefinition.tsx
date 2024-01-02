import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { LinearProgress, usePushHistory } from "../../components";
import { Helmet } from "react-helmet";
import { useWorkflowDef } from "../../data/workflow";
import SIMPLE_TEMPLATE from "./builder/templates/simpleTemplate.json";
import { TaskCoordinate, WorkflowDef } from "../../types/workflowDef";
import React from "react";
import DockLayout from "rc-dock";
import { getTabs, loadTab } from "./builder/tabRouter";
import BuilderToolbar from "./builder/BuilderToolbar";
import WorkflowDAG from "../../data/dag/WorkflowDAG";
import { makeStyles } from "@mui/styles";
import { produce } from "immer";
import { EditorTabSeverity } from "./builder/EditorTabHead";
import { format } from "date-fns";

type WorkflowDefParams = {
  name: string;
  version: string;
};

export type IDefEditorContext = {
  workflowName: string | undefined;
  workflowVersion: string | undefined;
  original: WorkflowDef;
  dag: WorkflowDAG;
  selectedTask: TaskCoordinate | null;
  isModified: boolean;
  changes: { [key: string]: EditorTabSeverity };

  reload: (
    name: string | undefined,
    version: string | undefined,
    refetchWorkflow?: boolean,
  ) => void;

  setSelectedTask: (coord: TaskCoordinate | null, source: string) => void;
  setOriginal: (original: WorkflowDef | undefined) => void;
  setDag: (sourceId: string, dag: WorkflowDAG) => void;
  setModified: (modified: boolean) => void;
  setSeverity: (tabId: string, severity: EditorTabSeverity) => void;
  setChanges: (changes: { [key: string]: EditorTabSeverity }) => void;
};

export const DefEditorContext = React.createContext<
  IDefEditorContext | undefined
>(undefined);
export const SelectedTaskContext = React.createContext<TaskCoordinate | null>(
  null,
);

const useStyles = makeStyles({
  column: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
});

const initLayout = {
  dockbox: {
    mode: "horizontal",
    children: [
      {
        group: "left",
        tabs: [{ id: "WorkflowBuilder" }, { id: "JsonPanel" }],
      },
      {
        group: "right",
        tabs: [],
      },
    ],
  },
} as any;

export default function WorkflowDefinition() {
  const params = useParams<WorkflowDefParams>();
  const classes = useStyles();
  const workflowName = params.name;
  const workflowVersion = params.version ? params.version : undefined;

  const [selectedTask, setSelectedTask] = useState<TaskCoordinate | null>(null);
  const [dag, setDag] = useState<WorkflowDAG | undefined>(undefined);
  const [changes, setChanges] = useState<{ [key: string]: EditorTabSeverity }>(
    {},
  );
  const [isModified, setModified] = useState(false);
  const [layout, setLayout] = useState(initLayout);
  const [original, setOriginal] = useState<WorkflowDef | undefined>();
  const navigate = usePushHistory();

  const {
    data: fetched,
    isFetching,
    refetch,
  } = useWorkflowDef(workflowName, workflowVersion);

  useEffect(() => {
    if (fetched) {
      setOriginal(fetched);
    } else if (!isFetching) {
      setOriginal(undefined);
      setDag(WorkflowDAG.fromWorkflowDef(newWorkflow(SIMPLE_TEMPLATE as any)));
      setModified(true);
    }
  }, [fetched, isFetching]);

  useEffect(() => {
    if (original) {
      setDag(WorkflowDAG.fromWorkflowDef(original));
    }
  }, [original]);

  useEffect(() => {
    if (dag) {
      setLayout((layout) =>
        produce(layout, (draft) => {
          const newTabs = getTabs(selectedTask, dag);
          draft.dockbox.children[1].tabs = newTabs;

          // Preserve activeTab
          const oldActiveTab = layout?.dockbox?.children[1]?.activeTab;
          if (newTabs.map((tab) => tab.id).includes(oldActiveTab)) {
            draft.dockbox.children[1].activeTab =
              layout.dockbox.children[1].activeTab;
          }
        }),
      );
    }
  }, [selectedTask, dag]);

  const reload = useCallback(
    (name?: string, version?: string, refetchWorkflow?: boolean) => {
      const askOverride = Object.entries(changes).reduce(
        (prev, [key, val]) => prev || !!val,
        false,
      );

      let confirmed = true;
      if (!refetchWorkflow && (askOverride || isModified)) {
        // Do not ask about override when refetch true because config just got saved.
        confirmed = window.confirm(
          "Changes not yet applied in the Task Config or JSON editor, or staged changes that have not been saved will be lost.",
        );
      }

      if (confirmed) {
        setSelectedTask(null);

        if (name === workflowName && version === workflowVersion) {
          if (refetchWorkflow) {
            console.log("refetching");
            refetch();
          } else {
            // Reset to fetched version
            console.log("resetting to original");
            setDag(WorkflowDAG.fromWorkflowDef(original!));
          }
        } else if (version === undefined) {
          navigate(`/workflowDef/${name}`);
        } else {
          navigate(`/workflowDef/${name}/${version}`);
        }
      }

      setModified(false);
    },
    [
      changes,
      isModified,
      navigate,
      original,
      refetch,
      workflowName,
      workflowVersion,
    ],
  );

  const setStaging = useCallback(
    (sourceId: string, newDag: WorkflowDAG) => {
      const askOverride = Object.entries(changes).reduce(
        (prev, [key, val]) => prev || (!!val && key !== sourceId),
        false,
      );
      let confirmed = true;
      if (askOverride) {
        confirmed = window.confirm(
          "Changes not yet applied in the Task Config or JSON editor will be lost.",
        );
      }

      if (confirmed) {
        if (selectedTask) {
          try {
            newDag.getTaskConfigByCoord(selectedTask);
          } catch (e) {
            // Selected task changed. Unset it.
            console.log("unsetting selectedTask");
            setSelectedTask(null);
          }
        }

        setChanges((changes) =>
          produce(changes, (draft) => {
            delete draft[sourceId];
            return draft;
          }),
        );
        setDag(newDag);
        setModified(true);
      }
    },
    [selectedTask, setSelectedTask, setDag, changes],
  );

  const setSeverity = useCallback(
    (tabId: string, severity: EditorTabSeverity) => {
      if (severity) {
        setChanges((changes) => ({ ...changes, [tabId]: severity }));
      } else {
        setChanges((changes) => {
          const newChanges = { ...changes };
          delete newChanges[tabId];
          return newChanges;
        });
      }
    },
    [],
  );

  const setSelectedTaskGated = useCallback(
    (selectedTask: TaskCoordinate | null, source: string) => {
      // Prompt for loss of changes if not originating from current source
      if (Object.keys(changes).find((src) => src !== source)) {
        const confirmed = window.confirm(
          "Changes not yet applied in the Task Config or JSON editor will be lost.",
        );
        if (!confirmed) {
          return;
        }
      }
      // Clear bullets
      setChanges({});
      setSelectedTask(selectedTask);
    },
    [setSelectedTask, changes],
  );

  const handleLayoutChange = useCallback(
    (newLayout) => {
      // control DockLayout from state
      if (Object.keys(changes).length > 0) {
        const confirmed = window.confirm(
          "Changes not yet applied in the current tab will be lost. OK to change tab. Cancel to abort.",
        );
        if (!confirmed) {
          return;
        }
      }
      setChanges({});
      setLayout(newLayout);
    },
    [changes],
  );

  return (
    <>
      <Helmet>
        <title>
          Conductor UI - Workflow Definition - {workflowName || "New Workflow"}
        </title>
      </Helmet>

      {isFetching && <LinearProgress />}
      {dag && (
        <DefEditorContext.Provider
          value={{
            workflowName,
            workflowVersion,
            original: original!,
            setOriginal,
            dag: dag!,
            setDag: setStaging,
            setSelectedTask: setSelectedTaskGated,
            selectedTask,
            reload,
            isModified,
            changes,
            setSeverity,
            setChanges,
            setModified,
          }}
        >
          <div className={classes.column}>
            <BuilderToolbar />
            <DockLayout
              style={{ flex: 1, width: "100%", height: "100%" }}
              loadTab={loadTab}
              layout={layout}
              onLayoutChange={handleLayoutChange}
              groups={{
                left: {
                  animated: false,
                },
                right: {
                  animated: false,
                },
              }}
            />
          </div>
        </DefEditorContext.Provider>
      )}
    </>
  );
}

export function newWorkflow(template: WorkflowDef) {
  const name = `untitled_${format(new Date(), "yyyyMMdd_HHmmss")}`;

  return { ...template, name };
}
