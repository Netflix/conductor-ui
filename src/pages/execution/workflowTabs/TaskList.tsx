import { TaskResult } from "../../../types/execution";
import { TypeColumns } from "@inovua/reactdatagrid-community/types/TypeColumn";
import { Tab } from "@mui/material";
import { TabPanel, TabContext, TabList } from "@mui/lab";
import GridOnIcon from "@mui/icons-material/TableRows";
import DataObjectIcon from "@mui/icons-material/DataObject";
import React from "react";
import { ReactJson } from "../../../components";
import { timestampRenderer } from "../../../utils/helpers";
import { TypeFilterValue } from "@inovua/reactdatagrid-community/types";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import DateFilter from "@inovua/reactdatagrid-community/DateFilter";
import { TaskCoordinate } from "../../../types/workflowDef";
import WorkflowDAG from "../../../data/dag/WorkflowDAG";
import DataGrid from "../../../components/DataGrid";

const filterValue: TypeFilterValue = [
  { name: "taskId", operator: "contains", type: "string", value: null },
  {
    name: "referenceTaskName",
    operator: "contains",
    type: "string",
    value: null,
  },
  { name: "taskDefName", operator: "contains", type: "string", value: null },
  { name: "taskType", operator: "contains", type: "string", value: null },
  { name: "scheduledTime", operator: "after", type: "date", value: "" },
  { name: "startTime", operator: "after", type: "date", value: "" },
  { name: "endTime", operator: "after", type: "date", value: "" },
  { name: "status", operator: "contains", type: "string", value: null },
  { name: "iteration", operator: "eq", type: "number", value: null },
  { name: "retryCount", operator: "eq", type: "number", value: null },
  { name: "correlationId", operator: "contains", type: "string", value: null },
];

const columns: TypeColumns = [
  {
    name: "seq",
    header: "Seq",
    render: ({ rowIndex }) => rowIndex + 1,
    maxWidth: 60,
  },
  { name: "taskId", header: "Task ID", defaultFlex: 1 },
  { name: "referenceTaskName", header: "Task Ref", defaultFlex: 1 },
  { name: "taskDefName", header: "Def Name", defaultFlex: 1 },
  { name: "taskType", header: "Type", defaultFlex: 1 },
  {
    name: "scheduledTime",
    header: "Scheduled",
    render: renderTimestamp,
    defaultFlex: 1,
    filterEditor: DateFilter,
  },
  {
    name: "startTime",
    header: "Start",
    render: renderTimestamp,
    defaultFlex: 1,
    filterEditor: DateFilter,
  },
  {
    name: "endTime",
    header: "End",
    render: renderTimestamp,
    defaultFlex: 1,
    filterEditor: DateFilter,
  },
  { name: "status", header: "Status", defaultFlex: 1 },
  {
    name: "iteration",
    header: "Iteration",
    defaultFlex: 1,
    defaultVisible: false,
    filterEditor: NumberFilter,
  },
  {
    name: "retryCount",
    header: "Retries",
    defaultFlex: 1,
    defaultVisible: false,
    filterEditor: NumberFilter,
  },
  {
    name: "correlationId",
    header: "Correlation ID",
    defaultFlex: 1,
    defaultVisible: false,
  },
  {
    name: "startDelayInSeconds",
    header: "Start Delay",
    defaultFlex: 1,
    defaultVisible: false,
  },
  {
    name: "responseTimeoutSeconds",
    header: "Response Timeout",
    defaultVisible: false,
  },
  {
    name: "workflowPriority",
    header: "Workflow Priority",
    defaultVisible: false,
  },
  { name: "queueWaitTime", header: "Queue Wait Time", defaultVisible: false },
  {
    name: "callbackAfterSeconds",
    header: "Callback After",
    defaultVisible: false,
  },
  { name: "pollCount", header: "Poll Count", defaultVisible: false },
];

export default function TaskList({
  tasks,
  workflowId,
  selectedTask,
  setSelectedTask,
  dag,
}: {
  tasks: TaskResult[];
  workflowId: string;
  setSelectedTask: (taskCoordinate: TaskCoordinate | null) => void;
  selectedTask: TaskCoordinate | null;
  dag: WorkflowDAG;
}) {
  const [mode, setMode] = React.useState("table");
  const selectedId =
    selectedTask && dag.getTaskResultByCoord(selectedTask)?.taskId;

  function handleSelectionChange({ data }: { data?: any }) {
    setSelectedTask(data ? { id: data.taskId } : null);
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <TabContext value={mode}>
        <TabList
          orientation="vertical"
          onChange={(event: React.SyntheticEvent, v: string) => setMode(v)}
        >
          <Tab
            icon={<GridOnIcon fontSize="small" />}
            value="table"
            sx={{ minWidth: 50 }}
          />
          <Tab
            icon={<DataObjectIcon fontSize="small" />}
            value="json"
            sx={{ minWidth: 50 }}
          />
        </TabList>
        <TabPanel
          value="table"
          style={{
            flex: 1,
            padding: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: 10 }}>
            Use the context menu &#9776; (found next to each table header) to
            add, remove or reorder columns.
          </div>
          <DataGrid
            localStorageKey="ExecutionTaskList"
            selected={selectedId}
            onSelectionChange={handleSelectionChange}
            columns={columns}
            dataSource={tasks}
            columnUserSelect
            idProperty="taskId"
            rowIndexColumn
            //theme="conductor-light"
            defaultFilterValue={filterValue}
          />
        </TabPanel>
        <TabPanel value="json" style={{ flex: 1, padding: 0 }}>
          <ReactJson src={tasks} label="Executed Tasks" path="tasks.json" />
        </TabPanel>
      </TabContext>
    </div>
  );
}

function renderTimestamp({ value }: { value: any }) {
  return timestampRenderer(value);
}
