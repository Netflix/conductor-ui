import { BaseEdge, EdgeProps, EdgeLabelRenderer } from "reactflow";
import _ from "lodash";
import React from "react";

export default function PolyLineEdge({ data, ...rest }: EdgeProps) {
  const { points, labelX, labelY, label } = data;
  const edgePath = points
    .filter(
      ({ x, y }: { x: number; y: number }) => _.isFinite(x) && _.isFinite(y),
    )
    .map(
      ({ x, y }: { x: number; y: number }, idx: number) =>
        `${idx === 0 ? "M" : "L"}${x},${y}`,
    )
    .join("");

  return (
    <>
      <BaseEdge path={edgePath} label="bob" {...rest} />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              fontWeight: 700,
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
