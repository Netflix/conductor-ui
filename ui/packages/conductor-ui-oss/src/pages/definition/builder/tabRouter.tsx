import { TabBase, TabData } from "rc-dock";
import JsonPanel from "./JsonPanel";
import WorkflowBuilder from "./WorkflowBuilder";
import WorkflowDAG from "../../../data/dag/WorkflowDAG";
import BlankPanel from "./panels/BlankPanel";
import InlineConfigPanel from "./panels/InlineConfigPanel";
import InlineEditorPanel from "./panels/InlineEditorPanel";
import SimpleConfigPanel from "./panels/SimpleConfigPanel";
import HttpConfigPanel from "./panels/HttpConfigPanel";
import JqTransformConfigPanel from "./panels/JqTransformConfigPanel";
import DynamicForkConfigPanel from "./panels/DynamicForkConfigPanel";
import StaticForkConfigPanel from "./panels/StaticForkConfigPanel";
import JoinConfigPanel from "./panels/JoinConfigPanel";
import WaitConfigPanel from "./panels/WaitConfigPanel";
import TerminateConfigPanel from "./panels/TerminateConfigPanel";
import SwitchConfigPanel from "./panels/SwitchConfigPanel";
import EditorTabHead from "./EditorTabHead";
import HumanConfigPanel from "./panels/HumanConfigPanel";
import DynamicConfigPanel from "./panels/DynamicConfigPanel";
import SubworkflowConfigPanel from "./panels/SubworkflowConfigPanel";
import SetVariableConfigPanel from "./panels/SetVariableConfigPanel";
import { DefEditorContext } from "../WorkflowDefinition";
import { FC, useCallback, useContext, useMemo } from "react";
import { GenericTaskConfig, TaskConfig } from "../../../types/workflowDef";
import StartWorkflowConfigPanel from "./panels/StartWorkflowConfigPanel";
import HttpRequestBodyPanel from "./panels/HttpRequestBodyPanel";
import DoWhileConfigPanel from "./panels/DoWhileConfigPanel";

export function getTabs(selectedTask, dag: WorkflowDAG) {
  let tabs: TabBase[] = [];
  const taskConfig = selectedTask && dag.getTaskConfigByCoord(selectedTask);

  if (!selectedTask || !taskConfig) {
    tabs = [
      {
        id: "BlankPanel",
      },
    ];
  } else if (taskConfig.type === "INLINE") {
    tabs = [{ id: "InlineConfigPanel" }, { id: "InlineEditorPanel" }];
  } else if (taskConfig.type === "SIMPLE") {
    tabs = [{ id: "SimpleConfigPanel" }];
  } else if (taskConfig.type === "DYNAMIC") {
    tabs = [{ id: "DynamicConfigPanel" }];
  } else if (taskConfig.type === "HTTP") {
    tabs = [{ id: "HttpConfigPanel" }, { id: "HttpRequestBodyPanel" }];
  } else if (taskConfig.type === "JSON_JQ_TRANSFORM") {
    tabs = [{ id: "JqTransformConfigPanel" }];
  } else if (taskConfig.type === "FORK_JOIN_DYNAMIC") {
    tabs = [{ id: "DynamicForkConfigPanel" }];
  } else if (taskConfig.type === "FORK_JOIN") {
    tabs = [{ id: "StaticForkConfigPanel" }];
  } else if (taskConfig.type === "JOIN") {
    tabs = [{ id: "JoinConfigPanel" }];
  } else if (taskConfig.type === "WAIT") {
    tabs = [{ id: "WaitConfigPanel" }];
  } else if (taskConfig.type === "HUMAN") {
    tabs = [{ id: "HumanConfigPanel" }];
  } else if (taskConfig.type === "SET_VARIABLE") {
    tabs = [{ id: "SetVariableConfigPanel" }];
  } else if (taskConfig.type === "START_WORKFLOW") {
    tabs = [{ id: "StartWorkflowConfigPanel" }];
  } else if (taskConfig.type === "SWITCH") {
    tabs = [{ id: "SwitchConfigPanel" }];
  } else if (taskConfig.type === "TERMINATE") {
    tabs = [{ id: "TerminateConfigPanel" }];
  } else if (taskConfig.type === "SUB_WORKFLOW") {
    tabs = [{ id: "SubworkflowConfigPanel" }];
  } else if (taskConfig.type === "DYNAMIC") {
    tabs = [{ id: "DynamicConfigPanel" }];
  } else if (taskConfig.type === "DO_WHILE") {
    tabs = [{ id: "DoWhileConfigPanel" }];
  } else {
    tabs = [{ id: "BlankPanel" }];
  }

  return tabs;
}

function makePanel(Panel: FC<PanelProps>, tabId: string, tabTitle?: string) {
  return {
    id: tabId,
    title: <EditorTabHead text={tabTitle || "Task Config"} tabId={tabId} />,
    content: <PanelWrapper tabId={tabId} Panel={Panel} />,
    cached: false,
  };
}

export function loadTab(tab: TabBase): TabData {
  const { id } = tab;

  if (id === "WorkflowBuilder") {
    return {
      id,
      title: "Workflow Builder",
      cached: true,
      content: <WorkflowBuilder />,
    };
  } else if (id === "JsonPanel") {
    return {
      id,
      title: <EditorTabHead text="JSON" tabId="JsonPanel" />,
      content: <JsonPanel tabId="JsonPanel" />,
    };
  } else if (id === "InlineConfigPanel") {
    return makePanel(InlineConfigPanel, id);
  } else if (id === "InlineEditorPanel") {
    return makePanel(InlineEditorPanel, id, "Script Editor");
  } else if (id === "SimpleConfigPanel") {
    return makePanel(SimpleConfigPanel, id);
  } else if (id === "HttpConfigPanel") {
    return makePanel(HttpConfigPanel, id);
  } else if (id === "HttpRequestBodyPanel") {
    return makePanel(HttpRequestBodyPanel, id, "Request Body");
  } else if (id === "JqTransformConfigPanel") {
    return makePanel(JqTransformConfigPanel, id);
  } else if (id === "DynamicConfigPanel") {
    return makePanel(DynamicConfigPanel, id);
  } else if (id === "DynamicForkConfigPanel") {
    return makePanel(DynamicForkConfigPanel, id);
  } else if (id === "StaticForkConfigPanel") {
    return makePanel(StaticForkConfigPanel, id);
  } else if (id === "JoinConfigPanel") {
    return makePanel(JoinConfigPanel, id);
  } else if (id === "WaitConfigPanel") {
    return makePanel(WaitConfigPanel, id);
  } else if (id === "HumanConfigPanel") {
    return makePanel(HumanConfigPanel, id);
  } else if (id === "SetVariableConfigPanel") {
    return makePanel(SetVariableConfigPanel, id);
  } else if (id === "SwitchConfigPanel") {
    return makePanel(SwitchConfigPanel, id);
  } else if (id === "TerminateConfigPanel") {
    return makePanel(TerminateConfigPanel, id);
  } else if (id === "SubworkflowConfigPanel") {
    return makePanel(SubworkflowConfigPanel, id);
  } else if (id === "StartWorkflowConfigPanel") {
    return makePanel(StartWorkflowConfigPanel, id);
  } else if (id === "DoWhileConfigPanel") {
    return makePanel(DoWhileConfigPanel, id);
  } else {
    return {
      id,
      title: "Task Config",
      content: <BlankPanel />,
    };
  }
}

function PanelWrapper({
  tabId,
  Panel,
}: {
  tabId: string;
  Panel: FC<PanelProps>;
}) {
  const { selectedTask, dag, setSeverity, setDag } =
    useContext(DefEditorContext)!;

  const taskConfig = useMemo(
    () => (selectedTask ? dag.getTaskConfigByCoord(selectedTask) : undefined),
    [selectedTask, dag],
  );

  const onChanged = useCallback(
    (value) => {
      setSeverity(tabId, value ? "INFO" : undefined);
    },
    [tabId, setSeverity],
  );

  const onUpdate = useCallback(
    (updatedState: TaskConfig) => {
      const originalRef = taskConfig!.taskReferenceName;
      const newDag = dag.clone();
      if (originalRef) {
        newDag.updateTask(originalRef, updatedState);
      }

      setDag(tabId, newDag);
    },
    [tabId, dag, setDag, taskConfig],
  );

  if (taskConfig && taskConfig.type !== "START") {
    return (
      <Panel
        tabId={tabId}
        initialConfig={taskConfig}
        onUpdate={onUpdate}
        onChanged={onChanged}
      />
    );
  } else {
    return null;
  }
}
export type PanelProps = {
  tabId: string;
  initialConfig: GenericTaskConfig;
  onUpdate: any;
  onChanged: any;
};
