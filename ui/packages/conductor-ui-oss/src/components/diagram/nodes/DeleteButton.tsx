import React, { useCallback } from "react";
import { Position, NodeToolbar, useStore } from "reactflow";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { makeStyles } from "@mui/styles";
import BuilderButton from "./BuilderButton";
const useStyles = makeStyles({
  deleteButton: {
    position: "absolute",
    top: -10,
  },
});

export type DeleteButtonProps = {
  toolbarVisible: boolean;
  nodeWidth: number;
  taskRef: string;
  handleDelete: (ref: string) => void;
  promptText?: string;
};

export default function DeleteButton({
  toolbarVisible,
  nodeWidth,
  taskRef,
  handleDelete,
  promptText,
}: DeleteButtonProps) {
  const classes = useStyles();
  const zoomLevel = useStore((store) => store.transform[2]);

  const handleDeleteClick = useCallback(() => {
    const result = window.confirm(
      promptText ||
        "Are you certain you want to delete this task: " + taskRef + "?",
    );
    if (result) {
      handleDelete(taskRef);
    }
  }, [taskRef, handleDelete, promptText]);

  return (
    <>
      {nodeWidth && (
        <NodeToolbar isVisible={toolbarVisible} position={Position.Top}>
          <BuilderButton
            className={classes.deleteButton}
            label="Delete this Task"
            style={{ left: (nodeWidth / 2) * zoomLevel + 5 }}
            color="#e50914"
            hoverColor="#f5e1e2"
            onClick={handleDeleteClick}
          >
            <DeleteIcon fontSize="inherit" color="inherit" />
          </BuilderButton>
        </NodeToolbar>
      )}
    </>
  );
}
