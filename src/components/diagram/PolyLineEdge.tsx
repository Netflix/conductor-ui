import { BaseEdge, EdgeProps } from 'reactflow';
import _ from "lodash";

export default function PolyLineEdge({data, markerEnd}: EdgeProps) {

  const { points } = data;
  const edgePath = points.filter(({x, y}: {x: number, y: number}) => _.isFinite(x) && _.isFinite(y)).map(({x, y}: {x: number, y:number}, idx: number) => `${idx === 0 ? 'M': 'L'}${x},${y}`).join("");
  console.log(markerEnd)

  return <BaseEdge path={edgePath} markerEnd={markerEnd} />;
}
