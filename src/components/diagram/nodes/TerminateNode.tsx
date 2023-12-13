import React, { memo, useContext } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Svg, Circle } from "react-svg-path";
import { FlowContext } from "../WorkflowFlow";
import DeleteButton from "./DeleteButton";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  label: {
    position: "absolute",
  },
});

function TerminateNode({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
}: NodeProps) {
  const classes = useStyles();
  const { handleDelete } = useContext(FlowContext);
  const { width: size } = data;
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <Svg width={size} height={size}>
        <Circle
          size={size - 1}
          cx={size / 2}
          cy={size / 2}
          stroke="#000"
          strokeWidth={1}
          fill="#eee"
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
      <div className={classes.label}>
        {data?.label.map((line, idx) => <div key={idx}>{line}</div>)}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.id}.bottom`}
      />
      <DeleteButton
        toolbarVisible={data.toolbarVisible}
        nodeWidth={data.width}
        handleDelete={handleDelete!}
        taskRef={id}
      />
    </>
  );
}

export default memo(TerminateNode);
