import React from "react";
import {
  render as dagreD3Render,
  intersect,
  Point,
  Render,
  dagre,
} from "dagre-d3";
import * as d3 from "d3";
import _ from "lodash";
import { withResizeDetector } from "react-resize-detector";
import parseSvgPath from "parse-svg-path";
import { Alert, IconButton, Toolbar } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import HomeIcon from "@mui/icons-material/Home";
import "./diagram.scss";
import WorkflowDAG, { NodeData } from "./WorkflowDAG";
import {
  DagEdgeProperties,
  ExtendedTaskConfigType,
  TaskCoordinate,
} from "../../types/workflowDef";
import { TaskResult } from "../../types/execution";
import pluralize from "pluralize";

const BAR_MARGIN = 50;
const BOTTOM_MARGIN = 30;

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
    e: PointerEvent,
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
type ZoomDir = "in" | "out";

interface GraphNodeProperties {
  label?: string;
  shape?: string;
  height?: number;
  labelStyle?: string;
  padding?: number;

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

class WorkflowGraph extends React.Component<WorkflowGraphProps> {
  renderer: Render;
  svgRef: React.RefObject<SVGSVGElement>;
  svg?: d3.Selection<any, {}, HTMLElement | null, any>;
  inner?: d3.Selection<any, {}, HTMLElement | null, any>;
  zoom?: d3.ZoomBehavior<Element, any>;
  graph: dagre.graphlib.Graph<GraphNodeProperties>;
  barNodes: string[];
  k = 1;
  tx = 0;
  ty = 0;

  constructor(props: WorkflowGraphProps) {
    super(props);
    this.svgRef = React.createRef();
    this.graph = new dagre.graphlib.Graph({ compound: true, multigraph: true });
    this.barNodes = [];

    this.renderer = new dagreD3Render();
    this.renderer.shapes().bar = barRenderer;
    this.renderer.shapes().stack = stackRenderer;
  }

  componentDidUpdate(prevProps: WorkflowGraphProps) {
    // useEffect on dag
    if (prevProps.dag !== this.props.dag) {
      this.graph = new dagre.graphlib.Graph({
        compound: true,
        multigraph: true,
      });
      this.barNodes = [];

      this.drawGraph();
      this.zoomHome();
    }

    // useEffect on selectedRef
    if (prevProps.selectedTask !== this.props.selectedTask) {
      this.highlightSelectedNode();
    }
  }

  componentDidMount() {
    this.svg = d3.select(this.svgRef.current);

    // Set up zoom support
    this.zoom = d3
      .zoom()
      .filter((event: any) => {
        return event.type !== "dblclick";
      })
      .on("zoom", (event: any) => {
        var t = event.transform;

        // If control is not pressed and a wheel was turned, set the scale to last known scale, and modify transform.x by some amount:
        if (
          !event.sourceEvent?.ctrlKey &&
          event.sourceEvent?.type === "wheel"
        ) {
          t.y = this.ty -= event.sourceEvent.deltaY / this.k;
          t.x = this.tx -= event.sourceEvent.deltaX / this.k;
          t.k = this.k;
        }
        // otherwise, proceed as normal, but track current k and tx:
        else {
          this.k = t.k;
          this.tx = t.x;
          this.ty = t.y;
        }

        // Apply the transform:
        if (this.inner) {
          this.inner.attr(
            "transform",
            "translate(" + [t.x, t.y] + ")scale(" + [t.k, t.k] + ")",
          );
        }
      });

    this.zoom(this.svg);

    if (this.props.dag) {
      this.drawGraph();
      this.highlightSelectedNode();
      this.zoomHome();
    }
  }

  highlightSelectedNode = () => {
    const { selectedTask } = this.props;

    const selectedRef = this.props.dag.getNodeRefByCoord(selectedTask);
    // Collapsed nodes

    const { inner } = this;
    if (inner) {
      inner.selectAll("g.node").classed("selected", false); // clear all selected

      if (selectedRef) {
        inner.select(`g[id='${selectedRef}']`).classed("selected", true);
      }
    }
  };

  zoomInOut = (dir: ZoomDir) => {
    const { svg, inner } = this;
    if (!inner || !svg) return;

    const currTransform = d3.zoomTransform(inner.node());
    const newZoom =
      dir === "in" ? currTransform.k * 1.25 : currTransform.k / 1.25;
    this.zoom?.transform(svg, d3.zoomIdentity.scale(newZoom));
    /*
    const postZoomedHeight = inner.node().getBoundingClientRect().height;
    svg.attr(
      "height",
      Math.max(postZoomedHeight + BOTTOM_MARGIN, GRAPH_MIN_HEIGHT)
    );
    */
  };

  zoomHome = () => {
    const { svg, inner } = this;
    if (!inner || !svg) return;
    const containerWidth = svg.node().getBoundingClientRect().width;
    const graphWidth = (this.graph.graph() as any).width;

    this.zoom?.transform(
      svg,
      d3.zoomIdentity.translate(containerWidth / 2 - graphWidth / 2, 0),
    );

    /*
    const postZoomedHeight = inner.node().getBoundingClientRect().height;
    svg.attr(
      "height",
      Math.max(postZoomedHeight + BOTTOM_MARGIN, GRAPH_MIN_HEIGHT)    
    );
    */
  };

  zoomToFit = () => {
    const { svg, inner } = this;
    if (!inner || !svg) return;

    const containerWidth = svg.node().getBoundingClientRect().width;
    const scale = Math.min(
      containerWidth / (this.graph.graph() as any).width,
      1,
    );
    this.zoom?.transform(svg, d3.zoomIdentity.scale(scale));

    // Adjust svg height to fit post-zoomed
    /*
    const postZoomedHeight = inner.nodes()[0].getBoundingClientRect().height;
    svg.attr(
      "height",
      Math.max(postZoomedHeight + BOTTOM_MARGIN, GRAPH_MIN_HEIGHT)
    );
    */
  };

  drawGraph = () => {
    if (!this.svg) return;
    if (this.inner) this.inner.remove();
    this.inner = this.svg.append("g");
    const { svg, inner } = this;

    const graph = this.graph;
    graph.setGraph({
      nodesep: 15,
      ranksep: 30,
    });

    const dagGraph = this.props.dag.graph;

    // Clone graph
    for (const nodeId of dagGraph.nodes()) {
      graph.setNode(nodeId, {});
    }
    for (const { v, w } of dagGraph.edges()) {
      graph.setEdge(v, w);
    }

    // Render Nodes
    for (const nodeId of graph.nodes()) {
      graph.setNode(nodeId, this.renderVertex(nodeId)); // Update nodes with render info
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

      if (this.props.executionMode) {
        const executed = dagEdge?.executed || graphEdge?.executed || false;
        if (executed) {
          classes.push("executed");
        } else {
          classes.push("dimmed");
          labelStyle = "fill: #ccc";
        }
      }

      const newProps: GraphEdge = {
        label: graphEdge?.label || dagEdge?.caseValue || "",
        labelStyle,
        class: classes.join(" "),
      };
      graph.setEdge(dagreEdge.v, dagreEdge.w, newProps, dagreEdge.name);
    }

    this.renderer(inner, graph);

    // Expand barNodes and rerender

    for (const barRef of this.barNodes) {
      this.expandBar(barRef);
    }

    // svg.width=100% via CSS
    svg.attr("height", (graph.graph() as any).height + BOTTOM_MARGIN);

    // Fix dagre-d3 bug with marker-end. Use css to set marker-end
    // See: https://github.com/dagrejs/dagre-d3/pull/413
    d3.selectAll("path.path").attr("marker-end", "");

    // Attach click handler
    inner
      .selectAll("g.node")
      .on("click", (e) =>
        this.handleClick(e as PointerEvent, this.props.onTaskSelect),
      );

    // Attach context handler
    inner.selectAll("g.node").on("contextmenu", (e: any) => {
      this.handleClick(e, this.props.onContextMenu);
      e.preventDefault();
    });

    // Make svg visible
    svg.attr("visibility", "visible");
  };

  handleBackgroundClick = () => {
    if (this.props.onTaskSelect) {
      this.props.onTaskSelect(null);
    }
  };

  handleClick = (
    e: PointerEvent,
    handler?: (
      coord: TaskCoordinate,
      type: ExtendedTaskConfigType,
      e: PointerEvent,
    ) => void,
  ) => {
    const path = e.composedPath && (e.composedPath() as SVGGElement[]);

    const taskRef = path[1]?.id || path[2].id; // could be 2 layers down
    const node = this.graph.node(taskRef);
    if (!node.type) {
      throw new Error("node is missing type");
    } else if (
      node.type === "DF_CHILDREN_PLACEHOLDER" ||
      node.type === "LOOP_CHILDREN_PLACEHOLDER"
    ) {
      if (handler && node.placeholderRef) {
        handler({ ref: node.placeholderRef }, node.type, e);
      }
    } else if (node.type === "DO_WHILE_END") {
      if (handler && node.aliasForRef) {
        handler({ ref: node.aliasForRef }, node.type, e);
      }
    } else if (taskRef !== "__final") {
      // Non-DF, or unexecuted DF vertex
      if (handler) {
        handler({ ref: taskRef }, node.type, e);
      }
    }
    e.stopPropagation();
  };

  render() {
    const { style, className } = this.props;
    return (
      <div style={style} className={`graphWrapper ${className || ""}`}>
        <Toolbar>
          <IconButton onClick={() => this.zoomInOut("in")}>
            <ZoomInIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={() => this.zoomInOut("out")}>
            <ZoomOutIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={this.zoomHome}>
            <HomeIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={this.zoomToFit}>
            <ZoomOutMapIcon fontSize="inherit" />
          </IconButton>
          <span>Shortcut: Ctrl + scroll to zoom</span>
          {!this.props.executionMode && (
            <Alert severity="info">
              <b>NEW!</b> Right-click on a task to start building.
            </Alert>
          )}
        </Toolbar>
        <svg
          ref={this.svgRef}
          className="graphSvg"
          onClick={this.handleBackgroundClick}
        >
          <defs>
            <filter id="brightness">
              <feComponentTransfer>
                <feFuncR type="linear" slope="0.9"></feFuncR>
                <feFuncG type="linear" slope="0.9"></feFuncG>
                <feFuncB type="linear" slope="0.9"></feFuncB>
              </feComponentTransfer>
            </filter>

            <filter
              id="dropShadow"
              height="300%"
              width="300%"
              x="-75%"
              y="-75%"
            >
              <feMorphology
                operator="dilate"
                radius="4"
                in="SourceAlpha"
                result="thicken"
              />
              <feGaussianBlur in="thicken" stdDeviation="7" result="blurred" />
              <feFlood floodColor="rgb(0,122,255)" result="glowColor" />
              <feComposite
                in="glowColor"
                in2="blurred"
                operator="in"
                result="softGlow_colored"
              />

              <feMerge>
                <feMergeNode in="softGlow_colored" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <marker
              id="endarrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 8 3, 0 6" />
            </marker>

            <marker
              id="startarrow"
              markerWidth="8"
              markerHeight="6"
              refX="0"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="8 0, 8 6, 0 3" />
            </marker>

            <marker
              id="endarrow-dimmed"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
              stroke="#c8c8c8"
              fill="#c8c8c8"
            >
              <polygon points="0 0, 8 3, 0 6" />
            </marker>

            <marker
              id="startarrow-dimmed"
              markerWidth="8"
              markerHeight="6"
              refX="0"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
              stroke="#c8c8c8"
              fill="#c8c8c8"
            >
              <polygon points="8 0, 8 6, 0 3" />
            </marker>
          </defs>
        </svg>
      </div>
    );
  }

  renderVertex = (ref: string) => {
    const dag = this.props.dag;

    const dagNode = dag.graph.node(ref) as NodeData;
    const { type, name } = dagNode.taskConfig;

    let retval: GraphNodeProperties = {
      id: ref,
      class: `type-${type}`,
      type: type,
    };

    switch (type) {
      case "SUB_WORKFLOW":
        retval.label = `${ref}\n(${name})`;
        break;
      case "TERMINAL":
        retval.label = name;
        retval.shape = "circle";
        break;
      case "TERMINATE":
        retval.label = `${ref}\n(terminate)`;
        retval.shape = "circle";
        break;
      case "FORK_JOIN":
      case "FORK_JOIN_DYNAMIC":
        retval = composeBarNode(ref, `${ref} (${name})`, type, "down");
        this.barNodes.push(ref);
        break;
      case "JOIN":
      case "EXCLUSIVE_JOIN":
        retval = composeBarNode(ref, `${ref} (${name})`, type, "up");
        this.barNodes.push(ref);
        break;
      case "DECISION":
      case "SWITCH":
        retval.label = ref;
        retval.shape = "diamond";
        retval.height = 40;
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
        const labelArray = [];
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
        retval.label = labelArray.join("\n");
        retval.shape = "stack";
        break;
      case "DO_WHILE":
        retval = composeBarNode(
          ref,
          `${ref} (${name}) [DO_WHILE]`,
          type,
          "down",
        );
        this.barNodes.push(ref);
        break;
      case "DO_WHILE_END":
        const alias = dagNode.taskConfig.aliasForRef as string;
        const aliasName = dag.getTaskConfigByRef(alias).name;
        retval = {
          ...composeBarNode(
            ref,
            `${alias} (${aliasName}) [DO_WHILE]`,
            type,
            "down",
          ),
          aliasForRef: alias,
        };
        this.barNodes.push(ref);

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
      default:
        retval.label = `${ref}\n(${name})`;
        retval.shape = "rect";
    }

    const attempts = dag.getTaskResultsByRef(ref)?.length || 0;
    if (attempts > 1) {
      retval.label += `\n${attempts} Attempts`;
    }

    if (this.props.executionMode) {
      if (dagNode.status) {
        if (type !== "TERMINAL") {
          retval.class += ` status_${dagNode.status}`;
        }
      } else {
        retval.class += " dimmed";
      }
    }

    return retval;
  };

  expandBar(barRef: string) {
    const barNode = this.graph.node(barRef);
    if (!barNode.elem) return;

    let fanOut: any;
    if (barNode.fanDir === "down") {
      fanOut = this.graph.outEdges(barRef)?.map((e) => {
        const points = parseSvgPath(
          this.graph.edge(e).elem.querySelector("path").getAttribute("d"),
        );
        return _.first(points);
      });
    } else {
      fanOut = this.graph.inEdges(barRef)?.map((e) => {
        const points = parseSvgPath(
          this.graph.edge(e).elem.querySelector("path").getAttribute("d"),
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
      `translate(${translateX}, ${translateY})`,
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
      `translate(${newTextTransformX}, ${currTextTransformY})`,
    );
  }
}

export default withResizeDetector(WorkflowGraph);

function composeBarNode(
  id: string,
  label: string,
  type: ExtendedTaskConfigType,
  fanDir: FanDir,
) {
  const retval: GraphNodeProperties = {
    id: id,
    type: type,
    fanDir: fanDir,
    class: `bar type-${type}`,
    shape: "bar",
    labelStyle: "font-size:11px",
    padding: 4,
    label,
  };
  return retval;
}

function barRenderer(
  parent: any,
  bbox: any,
  node: GraphNode,
): d3.Selection<any, string, any, any> {
  const group = parent.insert("g", ":first-child");
  group
    .insert("rect")
    .attr("width", bbox.width)
    .attr("height", bbox.height)
    .attr("transform", `translate(${-bbox.width / 2}, ${-bbox.height / 2})`);

  /*
  if(node.type === 'EXCLUSIVE_JOIN') {
    group.insert("rect")
    .attr("class", "underline")
    .attr("width", bbox.width)
    .attr("height", 3)
    .attr("transform", `translate(${-bbox.width/2}, ${bbox.height - 7})`);
  }*/

  node.intersect = function (point: Point) {
    // Only spread out arrows in fan direction
    return {
      x:
        (node.fanDir === "down" && point.y > node.y) ||
        (node.fanDir === "up" && point.y < node.y)
          ? point.x
          : intersect.rect(node, point).x,
      y: point.y < node.y ? node.y - bbox.height / 2 : node.y + bbox.height / 2,
    };
  };

  return group;
}

const STACK_OFFSET = 5;
function stackRenderer(
  parent: any,
  bbox: any,
  node: GraphNode,
): d3.Selection<any, string, any, any> {
  const group = parent.insert("g", ":first-child");

  group
    .insert("rect")
    .attr("width", bbox.width)
    .attr("height", bbox.height)
    .attr(
      "transform",
      `translate(${-bbox.width / 2 - STACK_OFFSET * 2}, ${
        -bbox.height / 2 - STACK_OFFSET * 2
      })`,
    );
  group
    .insert("rect")
    .attr("width", bbox.width)
    .attr("height", bbox.height)
    .attr(
      "transform",
      `translate(${-bbox.width / 2 - STACK_OFFSET}, ${
        -bbox.height / 2 - STACK_OFFSET
      })`,
    );
  group
    .insert("rect")
    .attr("width", bbox.width)
    .attr("height", bbox.height)
    .attr("transform", `translate(${-bbox.width / 2}, ${-bbox.height / 2})`);

  node.intersect = function (point: Point) {
    const retval = intersect.rect(node, point);
    if (retval.y < node.y) retval.y -= STACK_OFFSET;
    if (retval.y >= node.y) retval.y -= STACK_OFFSET * 2;

    return retval;
  };
  return group;
}

function getTranslateX(elem: SVGGraphicsElement) {
  return elem.transform.baseVal[0].matrix.e;
}
function getTranslateY(elem: SVGGraphicsElement) {
  return elem.transform.baseVal[0].matrix.f;
}
