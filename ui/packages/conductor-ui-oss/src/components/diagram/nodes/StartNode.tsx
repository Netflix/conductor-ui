import React, { memo, useContext } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Svg, Circle } from "react-svg-path";
import InsertButton from "./InsertButton";
import { FlowContext } from "../WorkflowFlow";

export const START_SIZE = 50;
function StartNode({ id, data }: NodeProps) {
  const { handleInsert } = useContext(FlowContext);

  return (
    <>
      <Svg width={START_SIZE} height={START_SIZE}>
        <Circle
          size={START_SIZE - 1}
          cx={START_SIZE / 2}
          cy={START_SIZE / 2}
          stroke="#000"
          strokeWidth={1}
          fill="#eee"
        />
        <text
          x={START_SIZE / 2}
          y={START_SIZE / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#000"
          fontSize={14}
          fontWeight="bold"
        >
          start
        </text>
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
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${data.id}.bottom`}
      />
      <InsertButton
        toolbarVisible={data.toolbarVisible}
        taskRef={id}
        handleInsert={handleInsert!}
      />
    </>
  );
}

export default memo(StartNode);
