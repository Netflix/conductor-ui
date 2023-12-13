import React, { PropsWithChildren, useCallback, useState } from "react";
import { Popover } from "@mui/material";
import { Position, NodeToolbar } from "reactflow";
import AddIcon from "@mui/icons-material/Add";
import { makeStyles } from "@mui/styles";
import BuilderButton from "./BuilderButton";
import { TaskConfigType } from "../../../types/workflowDef";
import TaskPicker from "../TaskPicker";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
  },
  button: {
    boxShadow: "0 0 2px 1px rgba(0, 0, 0, 0.08)",
  },
  deleteButton: {
    position: "absolute",
    top: -10,
  },
  addButton: {
    top: -2,
  },
  addCaseButton: {
    top: -2,
    left: 35,
  },
});

export type InsertButtonProps = {
  toolbarVisible: boolean;
  taskRef: string;
  handleInsert: (ref: string, type: TaskConfigType) => void;
  label?: string;
};

export default function InsertButton({
  toolbarVisible,
  taskRef,
  handleInsert,
  label,
  children,
}: PropsWithChildren<InsertButtonProps>) {
  const classes = useStyles();
  const [open, setOpen] = useState<Element | undefined>(undefined);

  const closePicker = useCallback(() => {
    setOpen(undefined);
  }, []);

  const openPicker = useCallback((event) => {
    setOpen(event.currentTarget);
  }, []);

  const onSelect = useCallback(
    (type) => {
      handleInsert(taskRef, type);
      setOpen(undefined);
    },
    [handleInsert, taskRef],
  );

  return (
    <NodeToolbar isVisible={toolbarVisible} position={Position.Bottom}>
      <BuilderButton
        className={classes.addButton}
        label={label || "Add following Task"}
        color="#0aa356"
        hoverColor="#def5ea"
        onClick={openPicker}
      >
        {children || <AddIcon fontSize="small" color="inherit" />}
      </BuilderButton>
      {open && (
        <Popover
          open
          transitionDuration={0}
          anchorEl={open}
          onClose={closePicker}
        >
          <TaskPicker open style={{ width: 400 }} onSelect={onSelect} />
        </Popover>
      )}
    </NodeToolbar>
  );
}
