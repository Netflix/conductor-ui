import {
  dagre
} from "dagre-d3";
import React, { useMemo } from "react";
import { Background, Controls, MarkerType, ReactFlow } from "reactflow";
import { TaskResult } from "../../types/execution";
import {
  DagEdgeProperties,
  ExtendedTaskConfigType,
  TaskCoordinate,
} from "../../types/workflowDef";
import WorkflowDAG, { NodeData } from "./WorkflowDAG";
import "./diagram.scss";
import PolyLineEdge from "./PolyLineEdge";
import { SWITCH_LAYOUT_WIDTH, SWITCH_HEIGHT, SwitchNode, StartNode, FinalNode, TERMINAL_SIZE } from "./CustomNodes";



interface WorkflowGraphProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onClick" | "onContextMenu"
  > {
  dag: WorkflowDAG;
  executionMode: boolean;
  onTaskSelect?: (task: TaskCoordinate | null) => void;
  onContextMenu?: (
    task: TaskCoordinate,
    type: ExtendedTaskConfigType,
    e: PointerEvent
  ) => void;
  selectedTask: TaskCoordinate | null;
}
type Tally = {
  success: number;
  inProgress: number;
  canceled: number;
  total: number;
};
type FanDir = "up" | "down";
//type ZoomDir = "in" | "out";

interface GraphNodeProperties {
  label?: string;
  shape?: string;
  height?: number;
  width?: number;
  labelStyle?: string;
  padding?: number;

  reactFlowType?: string;
  id?: string;
  name?: string;
  type?: ExtendedTaskConfigType;
  ref?: string;
  class?: string;
  tally?: Tally;
  aliasForRef?: string;
  placeholderRef?: string;
  status?: string;
  taskResults?: TaskResult;
  fanDir?: FanDir;
  elem?: SVGGraphicsElement;
  intersect?: Function;
}
type GraphNode = dagre.Node<GraphNodeProperties>;

interface GraphEdge {
  label?: string;
  labelStyle?: string;
  class?: string;

  executed?: boolean; // Only used for Loops. Typically refer to dagEdge.executed
  reverse?: boolean;
}

const nodeWidth = 150;
const nodeHeight = 57;

export default function WorkflowFlow({ dag }: WorkflowGraphProps) {
  const graph: dagre.graphlib.Graph = useMemo(() => {
    function renderVertex(ref: string) {
      const dagNode = dag.graph.node(ref) as NodeData;
      const { type, name } = dagNode.taskConfig;

      let retval: GraphNodeProperties = {
        id: ref,
        class: `type-${type}`,
        type: type,
        width: nodeWidth,
        height: nodeHeight
      };

      switch (type) {
        case "SUB_WORKFLOW":
          retval.label = `${ref}\n(${name})`;
          retval.reactFlowType = "subworkflow";
          break;
        case "TERMINAL":
          retval.label = name;
          retval.reactFlowType = ref === "__start" ? "start" : "final";
          retval.height = TERMINAL_SIZE;
          retval.width = TERMINAL_SIZE;
          break;
        case "TERMINATE":
          retval.label = `${ref}\n(terminate)`;
          retval.shape = "circle";
          break;
        case "FORK_JOIN":
        case "FORK_JOIN_DYNAMIC":
          retval.label =  `${ref}\n(${name})`;
          retval.reactFlowType = "fork";
          //retval = composeBarNode(ref, `${ref} (${name})`, type, "down");
          //this.barNodes.push(ref);
          break;
        case "JOIN":
        case "EXCLUSIVE_JOIN":
          retval.label =  `${ref}\n(${name})`;
          retval.reactFlowType = "join";
          //retval = composeBarNode(ref, `${ref} (${name})`, type, "up");
          //this.barNodes.push(ref);
          break;
        case "DECISION":
        case "SWITCH":
          retval.label = ref;
          retval.shape = "diamond";
          retval.reactFlowType = "switch";
          retval.height = SWITCH_HEIGHT;
          retval.width = SWITCH_LAYOUT_WIDTH;
          break;
        case "DF_CHILDREN_PLACEHOLDER":
          retval.shape = "stack";
          if (!dagNode.status) {
            retval.label = "Dynamically spawned tasks";
          } else {
            const { tally, containsTaskRefs } = dagNode;
            if (!tally || tally.total === 0) {
              retval.label = "No tasks spawned";
            } else {
              retval.label = `${tally.success} of ${tally.total} tasks succeeded`;
              if (tally?.inProgress) {
                retval.label += `\n${tally.inProgress} pending`;
              }
              if (tally?.canceled) {
                retval.label += `\n${tally.canceled} canceled`;
              }
              retval.placeholderRef = containsTaskRefs?.[0];
            }
          }
          retval.shape = "stack";
          break;
        case "LOOP_CHILDREN_PLACEHOLDER":
          retval.shape = "stack";

          const { tally, containsTaskRefs } = dagNode;
          if (!tally || tally.total === 0) {
            retval.label = "No tasks in loop";
          } else {
            retval.label = `${tally.total} tasks in loop`;
            if (tally?.failed) {
              retval.label += `\n${tally.failed} failed`;
            }
            if (tally?.inProgress) {
              retval.label += `\n${tally.inProgress} pending`;
            }
            if (tally?.canceled) {
              retval.label += `\n${tally.canceled} canceled`;
            }
            retval.placeholderRef = containsTaskRefs?.[0];
          }

          retval.shape = "stack";
          break;
        case "DO_WHILE":
          retval = composeBarNode(
            ref,
            `${ref} (${name}) [DO_WHILE]`,
            type,
            "down"
          );
          //this.barNodes.push(ref);
          break;
        case "DO_WHILE_END":
          const alias = dagNode.taskConfig.aliasForRef as string;
          const aliasName = dag.getTaskConfigByRef(alias).name;
          retval = {
            ...composeBarNode(
              ref,
              `${alias} (${aliasName}) [DO_WHILE]`,
              type,
              "down"
            ),
            aliasForRef: alias,
          };
          //this.barNodes.push(ref);

          // Add reverse decorative edge
          graph!.setEdge(
            alias,
            ref,
            {
              label: "LOOP",
              reverse: true,
              executed: !!dagNode.status,
            } as GraphEdge,
            `${ref}_loop_reverse`
          );

          break;
        default:
          retval.label = `${ref}\n(${name})`;
          retval.shape = "rect";
      }

      const attempts = dag.getTaskResultsByRef(ref)?.length || 0;
      if (attempts > 1) {
        retval.label += `\n${attempts} Attempts`;
      }

      /*
      if (this.props.executionMode) {
        if (dagNode.status) {
          if (type !== "TERMINAL") {
            retval.class += ` status_${dagNode.status}`;
          }
        } else {
          retval.class += " dimmed";
        }
      }
      */

      return retval;
    }


    const dagGraph = dag.graph;
    const graph = new dagre.graphlib.Graph({
      compound: true,
      multigraph: true,
    });

    graph.setGraph({
      nodesep: 50,
      ranksep: 50,
    });

    // Clone graph
    for (const nodeId of dagGraph.nodes()) {
      graph.setNode(nodeId, {});
    }
    for (const { v, w } of dagGraph.edges()) {
      graph.setEdge(v, w);
    }

    // Render Nodes
    for (const nodeId of graph.nodes()) {
      graph.setNode(nodeId, renderVertex(nodeId)); // Update nodes with render info
    }

    // Render Edges
    for (const dagreEdge of graph.edges()) {
      const dagEdge = dagGraph.edge({ v: dagreEdge.v, w: dagreEdge.w }) as
        | DagEdgeProperties
        | undefined;
      const graphEdge = graph.edge(dagreEdge);

      let classes: string[] = [];
      let labelStyle: string = "";

      if (!!graphEdge?.reverse) {
        classes.push("reverse");
      }

      const newProps: GraphEdge = {
        label: graphEdge?.label || dagEdge?.caseValue || "",
        labelStyle,
        class: classes.join(" "),
      };
      graph.setEdge(dagreEdge.v, dagreEdge.w, newProps, dagreEdge.name);
    }
    dagre.layout(graph);
    return graph;
  }, [dag]);

  const nodes = useMemo(() => {
    const nodes = graph.nodes().map(nodeId => {
      const node: GraphNode = graph.node(nodeId);

      return {
        id: nodeId,
        position: {
          x: node.x - node.width / 2,
          y: node.y - node.height / 2,
        },
        data: {
          label: node.label
        },
        type: node.reactFlowType,
        style: {
          width: node.width,
          height: node.height
        }
      }
    });

    return nodes;
  }, [graph]);

  const edges = useMemo(() => {
    const edges = graph.edges().map(edge => {
      const edgeNode = graph.edge(edge);
      return {
        id: `${edge.v}_${edge.w}`,
        source: edge.v,
        target: edge.w,
        markerEnd: {
          type: "arrowclosed" as MarkerType,
          color: "#000",
          width: 20,
          height: 20
        },
        style: {
          stroke: "#000",
          background: "transparent"
        },
        data: {
          points: edgeNode.points
        },
        type: "polyline"
      }
    });
    return edges;
  }, [graph]);

  console.log(graph.edges());
  console.log(graph.edge(graph.edges()[27]));
/*
  function expandBar(barRef: string) {
    const barNode = graph.node(barRef) as GraphNode;
    //if (!barNode.elem) return;
  
    let fanOut: any;
    if (barNode.fanDir === "down") {
      fanOut = graph.outEdges(barRef)?.map((e) => {
        const points = parseSvgPath(
          this.graph.edge(e).elem.querySelector("path").getAttribute("d")
        );
        return _.first(points);
      });
    } else {
      fanOut = this.graph.inEdges(barRef)?.map((e) => {
        const points = parseSvgPath(
          this.graph.edge(e).elem.querySelector("path").getAttribute("d")
        );
        return _.last(points);
      });
    }
  
    const barWidth = barNode.elem.getBBox().width;
    let translateX = getTranslateX(barNode.elem),
      translateY = getTranslateY(barNode.elem);
    let minX = barNode.x - barWidth / 2;
    let maxX = barNode.x + barWidth / 2;
  
    if (fanOut) {
      for (const point of fanOut) {
        const left = point[1] - BAR_MARGIN;
        const right = point[1] + BAR_MARGIN;
        if (right > maxX) maxX = right;
        if (left < minX) minX = left;
      }
    }
  
    if (minX < 0) {
      maxX = maxX - minX + BAR_MARGIN;
      minX = -BAR_MARGIN;
    }
  
    translateX = minX;
    barNode.elem.setAttribute(
      "transform",
      `translate(${translateX}, ${translateY})`
    );
  
    const rect = barNode.elem.querySelector("rect") as SVGRectElement;
    const currTransformY = rect.transform.baseVal[0].matrix.f;
    const newWidth = maxX - minX;
    const newTransformX = 0;
    rect.removeAttribute("transform");
    rect.setAttribute("y", String(currTransformY));
    rect.setAttribute("width", String(newWidth));
  
    const text = barNode.elem.querySelector("g.label > g") as SVGGElement;
    const textWidth = text.getBBox().width;
    const newTextTransformX = newTransformX + (newWidth - textWidth) / 2;
    const currTextTransformY = text.transform.baseVal[0].matrix.f;
    text.setAttribute(
      "transform",
      `translate(${newTextTransformX}, ${currTextTransformY})`
    );
  }
  }
*/
  return <ReactFlow style={{ width: '100%', height: '100%' }}
    nodes={nodes}
    edges={edges}
    nodesConnectable={false}
    nodeTypes={{
      switch: SwitchNode,
      start: StartNode,
      final: FinalNode,
    }}
    edgeTypes={{
      polyline: PolyLineEdge
    }}
  >
    <Background />
    <Controls />
  </ReactFlow>

}

function composeBarNode(ref: string, label: string, type: ExtendedTaskConfigType, dir: string) {
  return {
    id: ref,
    class: `type-${type}`,
    type: type,
    label: label
  };
}

