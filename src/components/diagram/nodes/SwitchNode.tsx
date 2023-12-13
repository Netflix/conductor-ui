import React, { useContext, memo, useCallback, useState, useMemo } from "react";
import { Handle, Position, NodeProps, NodeToolbar, useStore } from "reactflow";
import { Svg, Kite } from "react-svg-path";
import { makeStyles } from "@mui/styles";
import BuilderButton from "./BuilderButton";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import InsertButton from "./InsertButton";
import { FlowContext } from "../WorkflowFlow";
import { Popover } from "@mui/material";
import TaskPicker from "../TaskPicker";
import { DefEditorContext } from "../../../pages/definition/WorkflowDefinition";
import { SwitchTaskConfig } from "../../../types/workflowDef";
import _ from "lodash";

const useStyles: any = makeStyles({
  label: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  svg: {
    position: "absolute",
    zIndex: 1,
  },
  buttonGroup: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
});

function SwitchNode({ id, data }: NodeProps) {
  const { handleInsert, handleAddSwitchCase, handleDelete } =
    useContext(FlowContext);
  const zoomLevel = useStore((store) => store.transform[2]);

  const classes = useStyles();
  const { width, height, toolbarVisible, hasDefaultCase } = data;
  const w = width;
  const h = height;

  const [open, setOpen] = useState<
    | {
        element: Element | undefined;
        isDefault: boolean;
      }
    | undefined
  >(undefined);

  const closePicker = useCallback(() => {
    setOpen(undefined);
  }, []);

  const handleSelect = useCallback(
    (type) => {
      handleAddSwitchCase!(id, type, open!.isDefault);
    },
    [handleAddSwitchCase, id, open],
  );

  const handleDeleteClick = useCallback(() => {
    const result = window.confirm(
      `Are you certain you want to delete this task (${id}) and all its contained cases?`,
    );
    if (result) {
      handleDelete!(id);
    }
  }, [id, handleDelete]);

  if (isNaN(w) || isNaN(h)) {
    return null;
  }

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div className={classes.label}>{data?.label}</div>

      <Svg
        className={classes.svg}
        width={w}
        height={h}
        style={{ top: -(h - height) / 2 }}
      >
        <Kite
          width={w}
          height={h}
          dh={h / 2}
          cx={w / 2}
          cy={h / 2}
          stroke="#000"
          strokeWidth={1}
          fill="#fff"
        />
        <defs>
          <filter id="outline">
            <feMorphology
              in="SourceAlpha"
              result="expanded"
              operator="dilate"
              radius="4"
            />
            <feFlood floodColor="rgba(0,144,237,.4)" />
            <feComposite in2="expanded" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
      </Svg>
      <Handle type="source" position={Position.Bottom} />
      <NodeToolbar isVisible={toolbarVisible} position={Position.Top}>
        <div
          style={{ left: (width / 2) * zoomLevel + 5 }}
          className={classes.buttonGroup}
        >
          <BuilderButton
            className={classes.deleteButton}
            label="Delete Task"
            color="#e50914"
            hoverColor="#f5e1e2"
            onClick={handleDeleteClick}
          >
            <DeleteIcon fontSize="inherit" color="inherit" />
          </BuilderButton>

          <BuilderButton
            className={classes.addButton}
            label="Add Case"
            color="#2172e3"
            hoverColor="#dfe9f7"
            onClick={(e) => {
              setOpen({
                element: e.currentTarget,
                isDefault: false,
              });
            }}
          >
            =
          </BuilderButton>
          <BuilderButton
            disabled={hasDefaultCase}
            className={classes.addButton}
            label="Add Default Case"
            color="#2172e3"
            hoverColor="#dfe9f7"
            onClick={(e) => {
              setOpen({
                element: e.currentTarget,
                isDefault: true,
              });
            }}
          >
            {"\u2260"}
          </BuilderButton>
        </div>
      </NodeToolbar>
      <InsertButton
        toolbarVisible={data.toolbarVisible}
        taskRef={id}
        handleInsert={handleInsert!}
        label="Add follow task after all cases"
      />

      {open && (
        <Popover
          open
          transitionDuration={0}
          anchorEl={open.element}
          onClose={closePicker}
        >
          <TaskPicker open style={{ width: 400 }} onSelect={handleSelect} />
        </Popover>
      )}
    </>
  );
}

export default memo(SwitchNode);
