import { NestedMenuItem } from "mui-nested-menu";
import WorkflowGraph from "../../../components/diagram/WorkflowGraph";
import {
  TASK_CONFIG_TYPES,
  ExtendedTaskConfigType,
  TaskConfigType,
  TaskCoordinate,
  TaskConfig,
} from "../../../types/workflowDef";
import React, { useContext } from "react";
import { Menu, MenuItem } from "@mui/material";
import { DefEditorContext } from "../WorkflowDefinition";
import { useWorkflowDagFromDef } from "../../../data/execution";
import update from "immutability-helper";

export default function WorkflowBuilder() {
  const context = useContext(DefEditorContext);
  const dag = useWorkflowDagFromDef(context?.workflowDef)!;

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    ref: string;
    type: ExtendedTaskConfigType;
  } | null>(null);

  const handleTaskSelect = (coord: TaskCoordinate | null) => {
    if (context?.setSelectedTask) {
      context.setSelectedTask(coord);
    }
  };

  const handleNewTasks = (tasks: TaskConfig[]) => {
    if (context?.setWorkflowDef) {
      context.setWorkflowDef(
        update(context.workflowDef, { tasks: { $set: tasks } }),
      );
    }
  };

  const handleContextMenu = (
    taskCoord: TaskCoordinate,
    type: ExtendedTaskConfigType,
    event: PointerEvent,
  ) => {
    setContextMenu(
      contextMenu === null && taskCoord.ref
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            ref: taskCoord.ref,
            type: type,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null,
    );
  };

  const handleInsert = (type: TaskConfigType) => {
    if (contextMenu) {
      const newTasks = dag.insertAfter(contextMenu.ref, type);
      handleNewTasks(newTasks);
    }

    setContextMenu(null);
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu) {
      const newTasks = dag.deleteTask(contextMenu.ref);
      handleNewTasks(newTasks);
    }
    setContextMenu(null);
  };

  const handleAddForkTasks = (type: TaskConfigType) => {
    if (contextMenu) {
      const newTasks = dag.addForkTasks(contextMenu.ref, type);
      handleNewTasks(newTasks);
    }
    setContextMenu(null);
  };

  const handleAddSwitchCase = (type: TaskConfigType, isDefault: boolean) => {
    if (contextMenu) {
      const newTasks = dag.addSwitchCase(contextMenu.ref, type, isDefault);
      handleNewTasks(newTasks);
    }
    setContextMenu(null);
  };

  const handleAddLoopTask = (type: TaskConfigType, isDefault: boolean) => {
    if (contextMenu) {
      const newTasks = dag.addLoopTask(contextMenu.ref, type);
      handleNewTasks(newTasks);
    }
    setContextMenu(null);
  };

  const open = contextMenu !== null;

  return (
    <div>
      <WorkflowGraph
        dag={dag}
        onTaskSelect={handleTaskSelect}
        onContextMenu={handleContextMenu}
        executionMode={false}
        selectedTask={null}
      />
      <Menu
        open={open}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          open
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <NestedMenuItem label="Insert after this" parentMenuOpen={open}>
          {TASK_CONFIG_TYPES.map((type) => (
            <MenuItem key={type} onClick={() => handleInsert(type)}>
              {type}
            </MenuItem>
          ))}
        </NestedMenuItem>
        {contextMenu?.type === "FORK_JOIN" && (
          <NestedMenuItem label="Add fork branch" parentMenuOpen={open}>
            {TASK_CONFIG_TYPES.map((type) => (
              <MenuItem key={type} onClick={() => handleAddForkTasks(type)}>
                {type}
              </MenuItem>
            ))}
          </NestedMenuItem>
        )}
        {contextMenu?.type === "SWITCH" && (
          <NestedMenuItem label="Add case" parentMenuOpen={open}>
            {TASK_CONFIG_TYPES.map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleAddSwitchCase(type, false)}
              >
                {type}
              </MenuItem>
            ))}
          </NestedMenuItem>
        )}
        {contextMenu?.type === "SWITCH" && (
          <NestedMenuItem label="Add default case" parentMenuOpen={open}>
            {TASK_CONFIG_TYPES.map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleAddSwitchCase(type, true)}
              >
                {type}
              </MenuItem>
            ))}
          </NestedMenuItem>
        )}
        {contextMenu?.type === "DO_WHILE" && (
          <NestedMenuItem label="Add loop task" parentMenuOpen={open}>
            {TASK_CONFIG_TYPES.map((type) => (
              <MenuItem
                key={type}
                onClick={() => handleAddLoopTask(type, true)}
              >
                {type}
              </MenuItem>
            ))}
          </NestedMenuItem>
        )}

        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
}
