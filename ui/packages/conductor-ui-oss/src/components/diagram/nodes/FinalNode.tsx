import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Svg, Circle } from "react-svg-path";

export const FINAL_SIZE = 50;
function FinalNode({
  isConnectable,
  targetPosition = Position.Top,
}: NodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />

      <Svg width={FINAL_SIZE} height={FINAL_SIZE}>
        <Circle
          size={FINAL_SIZE - 1}
          cx={FINAL_SIZE / 2}
          cy={FINAL_SIZE / 2}
          stroke="#000"
          strokeWidth={1}
          fill="#eee"
        />
        <text
          x={FINAL_SIZE / 2}
          y={FINAL_SIZE / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#000"
          fontSize={14}
          fontWeight="bold"
        >
          final
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
    </>
  );
}

export default memo(FinalNode);
