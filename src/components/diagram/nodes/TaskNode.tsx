import { memo, useContext } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { makeStyles } from "@mui/styles";
import InsertButton from "./InsertButton";
import DeleteButton from "./DeleteButton";
import { FlowContext } from "../WorkflowFlow";
import {
  DynamicIcon,
  EventIcon,
  HttpIcon,
  HumanIcon,
  InlineIcon,
  JqTransformIcon,
  SetVariableIcon,
  StartWorkflowIcon,
  WaitIcon,
} from "../icons/taskIcons";

export function hasIcon(type: string | undefined) {
  return (
    type === "HTTP" ||
    type === "JSON_JQ_TRANSFORM" ||
    type === "LAMBDA" ||
    type === "INLINE" ||
    type === "EVENT" ||
    type === "HUMAN" ||
    type === "WAIT" ||
    type === "SET_VARIABLE" ||
    type === "START_WORKFLOW" ||
    type === "DYNAMIC"
  );
}

const useStyles = makeStyles({
  icon: {
    margin: 5,
  },
  label: {
    flex: 1,
  },
  wrapper: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
  },
  button: {
    boxShadow: "0 0 2px 1px rgba(0, 0, 0, 0.08)",
  },
  deleteButton: {
    background: "#e50914",
    color: "white",
    "&:hover": {
      background: "#99161d",
    },
  },
  addButton: {
    background: "#2172e3",
    color: "white",
    "&:hover": {
      background: "#1d529d",
    },
  },
});

const TaskNode = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  const classes = useStyles();
  const { handleInsert, handleDelete } = useContext(FlowContext);
  let icon;

  switch (data.type) {
    case "HTTP": {
      icon = <HttpIcon className={classes.icon} />;
      break;
    }
    case "JSON_JQ_TRANSFORM": {
      icon = <JqTransformIcon className={classes.icon} />;
      break;
    }
    case "LAMBDA":
    case "INLINE": {
      icon = <InlineIcon className={classes.icon} />;
      break;
    }
    case "EVENT":
      icon = <EventIcon className={classes.icon} />;
      break;
    case "HUMAN":
      icon = <HumanIcon className={classes.icon} />;
      break;
    case "WAIT":
      icon = <WaitIcon className={classes.icon} />;
      break;
    case "SET_VARIABLE":
      icon = <SetVariableIcon className={classes.icon} />;
      break;
    case "START_WORKFLOW":
      icon = <StartWorkflowIcon className={classes.icon} />;
      break;
    case "DYNAMIC":
      icon = <DynamicIcon className={classes.icon} />;
      break;
  }
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <div className={classes.wrapper}>
        {icon}
        <div className={classes.label}>
          {data?.label.map((line, idx) => <div key={idx}>{line}</div>)}
        </div>
      </div>
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
      <InsertButton
        toolbarVisible={data.toolbarVisible}
        handleInsert={handleInsert!}
        taskRef={id}
      />
      <DeleteButton
        toolbarVisible={data.toolbarVisible}
        nodeWidth={data.width}
        handleDelete={handleDelete!}
        taskRef={id}
      />
    </>
  );
};

export default memo(TaskNode);
