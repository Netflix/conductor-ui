import React, { memo } from "react";
import { NodeProps } from "reactflow";
import { Svg, Circle } from "react-svg-path";

export const DOT_SIZE = 5;
function DotNode({ id, data }: NodeProps) {
  return (
    <>
      <Svg width={DOT_SIZE} height={DOT_SIZE}>
        <Circle
          size={DOT_SIZE - 1}
          cx={DOT_SIZE / 2}
          cy={DOT_SIZE / 2}
          stroke="#f00"
          strokeWidth={1}
          fill="#f00"
        />
      </Svg>
    </>
  );
}

export default memo(DotNode);
