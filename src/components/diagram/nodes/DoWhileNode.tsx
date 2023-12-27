import { memo, useCallback, useContext, useState } from "react";
import { Handle, Position, NodeProps, NodeToolbar, useStore } from "reactflow";
import { makeStyles } from "@mui/styles";
import { DoWhileIcon } from "../icons/taskIcons";
import InsertButton from "./InsertButton";
import { FlowContext } from "../WorkflowFlow";
import { Popover } from "@mui/material";
import TaskPicker from "../TaskPicker";
import BuilderButton from "./BuilderButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

export const DO_WHILE_HEADER_HEIGHT = 22;
const useStyles = makeStyles({
  header: {
    color: "#fff",
    background: "#2c429c",
    lineHeight: `${DO_WHILE_HEADER_HEIGHT}px`,
  },
  doWhileIcon: {
    top: 30,
    left: 8,
    position: "absolute",
  },
  loopAddButton: {
    top: 5,
    zIndex: 1,
  },
  doWhileContainer: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 5,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  buttonGroup: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  emptyLoop: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const DoWhileNode = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  const { height, width } = data;
  const classes = useStyles();
  const { handleInsert, handleAddLoopTask, handleDelete } =
    useContext(FlowContext);
  const zoomLevel = useStore((store) => store.transform[2]);

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
      handleAddLoopTask(id, type, open!.isDefault);
    },
    [handleAddLoopTask, id, open],
  );

  const handleAddLoopTaskClick = useCallback((e) => {
    setOpen({
      element: e.currentTarget,
      isDefault: false,
    });
  }, []);

  const handleDeleteClick = useCallback(() => {
    const result = window.confirm(
      `Are you certain you want to delete this loop task (${id}) and all its contained tasks?`,
    );
    if (result) {
      handleDelete!(id);
    }
  }, [id, handleDelete]);

  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <div
        style={{
          width: width,
          height: height,
        }}
        className={classes.doWhileContainer}
      >
        <div className={classes.header}>{data.label}</div>
        <DoWhileIcon className={classes.doWhileIcon} />
        {data.isEmpty && (
          <div className={classes.emptyLoop}>
            <div>Empty Loop</div>
          </div>
        )}
      </div>
      <InsertButton
        toolbarVisible={data.toolbarVisible}
        taskRef={id}
        handleInsert={handleInsert!}
        label="Add task after loop"
      />
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
      <NodeToolbar isVisible={data.toolbarVisible} position={Position.Top}>
        <div
          style={{ left: (width / 2) * zoomLevel + 5 }}
          className={classes.buttonGroup}
        >
          <BuilderButton
            label="Delete Loop"
            color="#e50914"
            hoverColor="#f5e1e2"
            onClick={handleDeleteClick}
          >
            <DeleteIcon fontSize="inherit" color="inherit" />
          </BuilderButton>

          <BuilderButton
            label="Add a task to the beginning of this loop"
            color="#2172e3"
            hoverColor="#dfe9f7"
            onClick={handleAddLoopTaskClick}
          >
            <AddIcon fontSize="small" color="inherit" />
          </BuilderButton>
        </div>
      </NodeToolbar>

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
};

export default memo(DoWhileNode);
