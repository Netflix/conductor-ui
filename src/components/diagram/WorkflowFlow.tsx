import dagre from "dagre";
import intersectPolygon from "./intersect/intersect-polygon";
import intersectRect from "./intersect/intersect-rect";
import _ from "lodash";
import pixelWidth from "string-pixel-width";
import { useResizeDetector } from "react-resize-detector";

import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  createContext,
} from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  Node,
  Edge,
  applyEdgeChanges,
  NodeSelectionChange,
} from "reactflow";

import { TaskResult } from "../../types/execution";
import {
  ExtendedTaskConfigType,
  SwitchTaskConfig,
  TaskConfigType,
  TaskCoordinate,
} from "../../types/workflowDef";
import WorkflowDAG from "../../data/dag/WorkflowDAG";
import "./diagram.scss";
import PolyLineEdge from "./PolyLineEdge";

import StartNode from "./nodes/StartNode";
import FinalNode from "./nodes/FinalNode";
import SwitchNode from "./nodes/SwitchNode";
import TaskNode, { hasIcon } from "./nodes/TaskNode";
import ForkNode from "./nodes/ForkNode";
import JoinNode from "./nodes/JoinNode";
import StackNode from "./nodes/StackNode";
import pluralize from "pluralize";

import "reactflow/dist/style.css";
import "./nodes/customNodes.css";
import { Point } from "./intersect";
import { FINAL_SIZE } from "./nodes/FinalNode";
import DotNode from "./nodes/DotNode";
import TerminateNode from "./nodes/TerminateNode";

interface WorkflowFlowProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onClick" | "onContextMenu"
  > {
  dag: WorkflowDAG;
  selectedTask: TaskCoordinate | null;
  onTaskSelect?: (task: TaskCoordinate | null) => void;
  handleNewTasks?: (dag: WorkflowDAG) => void;
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
  height?: number;
  width?: number;
  padding?: number;
  selectable?: boolean;

  reactFlowType?: string;
  label: string[];
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
  points?: Point[];
  hasDefaultCase?: boolean;
}
export type GraphNode = dagre.Node<GraphNodeProperties>;

type FlowGraph = dagre.graphlib.Graph<GraphNodeProperties>;
type Size = { width: number; height: number };

export type IFlowContext = {
  handleInsert?: (ref: string, type: TaskConfigType) => void;
  handleDelete?: (ref: string) => void;
  handleAddForkTask?: (ref: string, type: TaskConfigType) => void;
  handleAddSwitchCase?: (
    parentRef: string,
    type: TaskConfigType,
    isDefault: boolean,
  ) => void;
  handleAddLoopTask?: any;
};

export const FlowContext = createContext<IFlowContext>({});

const nodeTypes = {
  SWITCH: SwitchNode,
  START: StartNode,
  FINAL: FinalNode,
  SUB_WORKFLOW: TaskNode,
  SIMPLE: TaskNode,
  DYNAMIC: TaskNode,
  FORK_JOIN: ForkNode,
  FORK_JOIN_DYNAMIC: ForkNode,
  JSON_JQ_TRANSFORM: TaskNode,
  SET_VARIABLE: TaskNode,
  START_WORKFLOW: TaskNode,
  INLINE: TaskNode,
  JOIN: JoinNode,
  HTTP: TaskNode,
  DECISION: TaskNode,
  HUMAN: TaskNode,
  WAIT: TaskNode,
  DF_CHILDREN_PLACEHOLDER: StackNode,
  TERMINATE: TerminateNode,
  DOT: DotNode,
};

export default function WorkflowFlow({
  dag,
  onTaskSelect,
  selectedTask,
  handleNewTasks,
}: WorkflowFlowProps) {
  const { width, ref } = useResizeDetector();

  const edgeTypes = useMemo(
    () => ({
      polyline: PolyLineEdge,
    }),
    [],
  );

  const graph = useMemo(() => {
    return drawGraph(dag);
  }, [dag]);

  const initNodes = useMemo(() => {
    const nodes: Node[] = graph.nodes().map((nodeId) => {
      const node: GraphNode = graph.node(nodeId);
      return {
        id: nodeId,
        position: {
          x: node.x - node.width / 2,
          y: node.y - node.height / 2,
        },
        data: {
          label: node.label,
          type: node.type,
          width: node.width,
          height: node.height,
          fanDir: node.fanDir,
          hasDefaultCase: node.hasDefaultCase,
        },
        type: node.type,
        style: {
          width: node.width,
          height: node.height,
        },
        selectable: node.selectable,
      };
    });

    return nodes;
  }, [graph]);

  const viewportX = useMemo(() => {
    const startNode = graph.node("__start");
    return width && startNode ? width / 2 - startNode.x : undefined;
  }, [graph, width]);

  const initEdges: Edge[] = useMemo(() => {
    const edges = graph.edges().map((edge) => {
      const graphEdge = graph.edge(edge);
      return {
        id: `${edge.v}_${edge.w}`,
        source: edge.v,
        target: edge.w,
        markerEnd: {
          type: "arrowclosed" as MarkerType,
          color: "#000",
          width: 20,
          height: 20,
        },
        style: {
          stroke: "#000",
          background: "transparent",
        },
        data: {
          points: graphEdge.points,
          label: graphEdge.label,
          labelX: graphEdge.x,
          labelY: graphEdge.y,
        },
        type: "polyline",
      };
    });
    return edges;
  }, [graph]);

  const [nodes, setNodes] = useState(initNodes);
  const [edges, setEdges] = useState(initEdges);

  useEffect(() => {
    setNodes(initNodes);
  }, [initNodes]);

  useEffect(() => {
    setEdges(initEdges);
  }, [initEdges]);

  useEffect(() => {
    setNodes((ns) => {
      const newNodes = _.cloneDeep(initNodes);
      const ourNode = newNodes.find((node) => node.id === selectedTask?.ref);
      if (ourNode) {
        ourNode.selected = true;
      }
      return newNodes;
    });
  }, [selectedTask, initNodes]);

  const onNodesChange = useCallback(
    (changes) => {
      // Swallow changes and wait for useEffect on selectedTask to apply
      setNodes((ns) => {
        return [...ns];
      });

      const selection = changes.find(
        (change) => change.type === "select" && change.selected,
      ) as NodeSelectionChange;
      if (onTaskSelect) {
        if (selection) {
          onTaskSelect({ ref: selection.id });
        }
      }
    },
    [onTaskSelect],
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((es) => {
        return applyEdgeChanges(changes, es);
      }),
    [],
  );

  const handleInsert = useCallback(
    (ref: string, type: TaskConfigType) => {
      const newDag = dag.clone();
      newDag.insertAfter(ref, type);
      if (handleNewTasks) handleNewTasks(newDag);
    },
    [dag, handleNewTasks],
  );

  const handleDelete = useCallback(
    (ref: string) => {
      onTaskSelect!(null);

      const newDag = dag.clone();
      newDag.deleteTask(ref);
      if (handleNewTasks) handleNewTasks(newDag);
    },
    [dag, handleNewTasks, onTaskSelect],
  );

  const handleAddForkTask = useCallback(
    (ref: string, type: TaskConfigType) => {
      const newDag = dag.clone();
      newDag.addForkTasks(ref, type);
      if (handleNewTasks) handleNewTasks(newDag);
    },
    [dag, handleNewTasks],
  );

  const handleAddSwitchCase = useCallback(
    (ref: string, type: TaskConfigType, isDefault: boolean) => {
      const newDag = dag.clone();
      newDag.addSwitchCase(ref, type, isDefault);
      if (handleNewTasks) handleNewTasks(newDag);
    },
    [dag, handleNewTasks],
  );

  const handleAddLoopTask = useCallback(
    (ref: string, type: TaskConfigType, isDefault: boolean) => {
      const newDag = dag.clone();
      newDag.addLoopTask(ref, type);
      if (handleNewTasks) handleNewTasks(newDag);
    },
    [dag, handleNewTasks],
  );

  return (
    <FlowContext.Provider
      value={{
        handleInsert,
        handleDelete,
        handleAddForkTask,
        handleAddSwitchCase,
        handleAddLoopTask,
      }}
    >
      <div style={{ width: "100%", height: "100%" }} ref={ref}>
        {!!viewportX && (
          <ReactFlow
            style={{ width: "100%", height: "100%" }}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            selectionOnDrag={false}
            selectNodesOnDrag={false}
            panOnScroll
            defaultViewport={{
              x: viewportX,
              y: 10,
              zoom: 1,
            }}
            multiSelectionKeyCode={null}
            zoomOnDoubleClick={false}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </FlowContext.Provider>
  );
}

function composeBarNode(
  ref: string,
  name: string,
  type: ExtendedTaskConfigType,
  dir: FanDir,
) {
  return {
    id: ref,
    shape: "bar",
    class: `type-${type}`,
    type: type,
    label: [`${ref} (${name})`],
    fanDir: dir,
  };
}

function drawGraph(dag: WorkflowDAG): FlowGraph {
  const barNodes = [];
  const graph = new dagre.graphlib.Graph<GraphNodeProperties>({
    compound: true,
    multigraph: true,
  });

  graph.setGraph({
    nodesep: 15,
    ranksep: 45,
  });

  const dagGraph = dag.graph;

  // Clone graph
  for (const { v, w } of dagGraph.edges()) {
    graph.setEdge(v, w);
  }

  // Render Nodes
  for (const ref of dagGraph.nodes()) {
    graph.setNode(ref, renderVertex(ref, barNodes, dag)); // Update nodes with render info
  }

  // Render Edges
  for (const edge of dagGraph.edges()) {
    const dagEdge = dagGraph.edge({ v: edge.v, w: edge.w });

    let classes: string[] = [];

    // TODO: replace classes
    if (!!dagEdge?.reverse) {
      classes.push("reverse");
    }

    const label = dagEdge.label || dagEdge.caseValue;
    graph.setEdge(
      edge.v,
      edge.w,
      {
        label,
        width: pixelWidth(label, { font: "helvetica", size: 12, bold: true }),
        height: 18,
      },
      edge.name,
    );
  }

  // Expand barNodes and rerender

  // Run Layout
  dagre.layout(graph);

  appendDiamondPoints(graph);

  assignNodeIntersects(graph);

  for (const barRef of barNodes) {
    expandBar(barRef, graph);
  }

  return graph;
}

function renderVertex(ref: string, barNodes, dag: WorkflowDAG) {
  const dagNode = dag.graph.node(ref);
  const { type, name } = dagNode.taskConfig;

  let retval: GraphNodeProperties = {
    id: ref,
    class: `type-${type}`,
    type: type,
    label: [name],
  };

  switch (type) {
    case "SUB_WORKFLOW":
      retval.label = [ref, name];
      break;
    case "START":
      break;
    case "FINAL":
      retval.selectable = false;
      break;
    case "TERMINATE":
      retval.label = [ref];
      break;
    case "FORK_JOIN":
    case "FORK_JOIN_DYNAMIC":
      retval = composeBarNode(ref, name, type, "down");
      barNodes.push(ref);
      break;
    case "JOIN":
    case "EXCLUSIVE_JOIN":
      retval = composeBarNode(ref, name, type, "up");
      barNodes.push(ref);
      break;
    case "DECISION":
    case "SWITCH":
      retval.label = [ref];
      retval.hasDefaultCase = !_.isEmpty(
        (dagNode.taskConfig as SwitchTaskConfig).defaultCase,
      );
      break;
    case "DF_CHILDREN_PLACEHOLDER":
      if (!dagNode.status) {
        retval.label = ["Dynamically spawned tasks"];
      } else {
        const { tally, containsTaskRefs } = dagNode;
        if (!tally || tally.total === 0) {
          retval.label = ["No tasks spawned"];
        } else {
          retval.label = [`${tally.success} of ${tally.total} tasks succeeded`];
          if (tally?.inProgress) {
            retval.label.push(`${tally.inProgress} pending`);
          }
          if (tally?.canceled) {
            retval.label.push(`${tally.canceled} canceled`);
          }
          retval.placeholderRef = containsTaskRefs?.[0];
        }
      }
      retval.selectable = false;
      break;
    case "LOOP_CHILDREN_PLACEHOLDER":
      const labelArray: string[] = [];
      const { tally, containsTaskRefs } = dagNode;
      if (tally?.iterations) {
        labelArray.push(
          `${tally.iterations} ${pluralize("iterations", tally.iterations)}`,
        );
      }
      if (!tally || tally.total === 0) {
        labelArray.push("No tasks in loop");
      } else {
        if (tally?.success) {
          labelArray.push(`${tally.success} succeeded`);
        }
        if (tally?.failed) {
          labelArray.push(`${tally.failed} failed`);
        }
        if (tally?.inProgress) {
          labelArray.push(`${tally.inProgress} in-progress`);
        }
        if (tally?.canceled) {
          labelArray.push(`${tally.canceled} canceled`);
        }
        retval.placeholderRef = containsTaskRefs?.[0];
      }
      retval.label = labelArray;
      break;
    /*
    case "DO_WHILE":
      retval = composeBarNode(
        ref,
        `${ref} (${name}) [DO_WHILE]`,
        type,
        "down",
      );
      barNodes.push(ref);
      break;
    case "DO_WHILE_END":
      const alias = dagNode.taskConfig.aliasForRef as string;
      const aliasName = dag.getTaskConfigByRef(alias).name;
      retval = {
        ...composeBarNode(
          ref,
          aliasName,
          //`${alias} (${aliasName}) [DO_WHILE]`,
          type,
          "down",
        ),
        aliasForRef: alias,
      };
      barNodes.push(ref);

      // Add reverse decorative edge      
      this.graph.setEdge(
        alias,
        ref,
        {
          label: "LOOP",
          reverse: true,
          executed: !!dagNode.status,
        } as GraphEdge,
        `${ref}_loop_reverse`,
      );
      
      break;
      */
    default:
      retval.label = [ref, `(${name})`];
  }

  const attempts = dag.getTaskResultsByRef(ref)?.length || 0;
  if (attempts > 1) {
    retval.label.push(`${attempts} Attempts`);
  }

  let bbox: Size;
  bbox = getBBox(retval.label, retval.type, hasIcon(retval.type));

  retval.width = bbox.width;
  retval.height = bbox.height;

  /*
  if (executionMode) {
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

const BAR_H_MARGIN = 50;
const BAR_V_MARGIN = 3;
const MARGIN = 10;
const LINE_HEIGHT = 15;
const ICON_WIDTH = 28;

function getBBox(
  lines: string[],
  type: ExtendedTaskConfigType | undefined,
  hasIcon: boolean,
): Size {
  const iconWidth = hasIcon ? ICON_WIDTH : 0;

  if (lines.length === 0) {
    return {
      width: 150,
      height: 50,
    };
  }

  const maxCharLen = Math.max(
    ...lines.map((line) => pixelWidth(line, { font: "helvetica", size: 13 })),
  );

  if (isDiamond(type)) {
    return {
      width: maxCharLen * 1.5,
      height: (MARGIN * 2 + LINE_HEIGHT * lines.length) * 2.3,
    };
  } else if (isBar(type)) {
    return {
      width: BAR_H_MARGIN * 2 + maxCharLen,
      height: BAR_V_MARGIN * 2 + LINE_HEIGHT,
    };
  } else if (isStack(type)) {
    return {
      width: MARGIN * 4 + maxCharLen + iconWidth,
      height: MARGIN * 6 + LINE_HEIGHT * lines.length,
    };
  } else if (isTerminal(type)) {
    return {
      width: FINAL_SIZE,
      height: FINAL_SIZE,
    };
  } else {
    return {
      width: MARGIN * 2 + maxCharLen + iconWidth,
      height: MARGIN * 2 + LINE_HEIGHT * lines.length,
    };
  }
}

function intersectNode(node: GraphNode, point: Point) {
  if (isDiamond(node.type)) {
    return intersectPolygon(node, point);
  } else {
    return intersectRect(node, point);
  }
}

function appendDiamondPoints(g: FlowGraph) {
  g.nodes().forEach((n) => {
    const node = g.node(n);
    if (isDiamond(node.type)) {
      node.points = diamondPoints(node);
    }
  });
}

function assignNodeIntersects(g: FlowGraph) {
  g.edges().forEach((e) => {
    var edge = g.edge(e);
    var nodeV = g.node(e.v);
    var nodeW = g.node(e.w);
    var p1, p2;
    if (!edge.points) {
      edge.points = [];
      p1 = nodeW;
      p2 = nodeV;
    } else {
      p1 = edge.points[0];
      p2 = edge.points[edge.points.length - 1];
    }
    edge.points[0] = intersectNode(nodeV, p1);
    edge.points[edge.points.length - 1] = intersectNode(nodeW, p2);
  });
}

function diamondPoints(node: dagre.Node): Point[] {
  return [
    { x: node.x, y: node.y - node.height / 2 },
    { x: node.x + node.width / 2, y: node.y },
    { x: node.x, y: node.y + node.height / 2 },
    { x: node.x - node.width / 2, y: node.y },
    { x: node.x, y: node.y - node.height / 2 },
  ];
}

function expandBar(barRef: string, graph: FlowGraph) {
  const barNode = graph.node(barRef);

  let globalMinX = Infinity;
  let globalMaxX = -Infinity;

  // Redraw Edges to be straight
  if (barNode.fanDir === "down") {
    const edges = graph.outEdges(barRef)!;
    for (const edge of edges) {
      const graphEdge = graph.edge(edge);
      const originX = _.first(graphEdge.points)?.x!;
      let maxAbsDeviation = -Infinity;
      let extremeX;

      for (const point of graphEdge.points) {
        const abs = Math.abs(point.x - originX);
        if (abs > maxAbsDeviation) {
          extremeX = point.x;
          maxAbsDeviation = abs;
        }
      }

      graphEdge.points[0].x = extremeX;
      if (extremeX < globalMinX) globalMinX = extremeX;
      if (extremeX > globalMaxX) globalMaxX = extremeX;
    }
  } else {
    const edges = graph.inEdges(barRef)!;
    for (const edge of edges) {
      const graphEdge = graph.edge(edge);
      const originX = _.last(graphEdge.points)?.x!;
      let maxAbsDeviation = -Infinity;
      let extremeX;

      for (const point of graphEdge.points) {
        const abs = Math.abs(point.x - originX);
        if (abs > maxAbsDeviation) {
          extremeX = point.x;
          maxAbsDeviation = abs;
        }
      }

      graphEdge.points[graphEdge.points.length - 1].x = extremeX;
      if (extremeX < globalMinX) globalMinX = extremeX;
      if (extremeX > globalMaxX) globalMaxX = extremeX;
    }
  }

  globalMinX -= BAR_H_MARGIN;
  globalMaxX += BAR_H_MARGIN;

  // Only reconfigure if bar larger than original
  if (globalMaxX - globalMinX > barNode.width) {
    barNode.width = globalMaxX - globalMinX;
    barNode.x = (globalMaxX + globalMinX) / 2;
  }
}

function isDiamond(type: ExtendedTaskConfigType | undefined) {
  return type === "SWITCH" || type === "DECISION";
}

function isBar(type: ExtendedTaskConfigType | undefined) {
  return (
    type === "FORK_JOIN" || type === "FORK_JOIN_DYNAMIC" || type === "JOIN"
  );
}

function isStack(type: ExtendedTaskConfigType | undefined) {
  return (
    type === "DF_CHILDREN_PLACEHOLDER" || type === "LOOP_CHILDREN_PLACEHOLDER"
  );
}

function isTerminal(type: ExtendedTaskConfigType | undefined) {
  return type === "START" || type === "FINAL";
}
