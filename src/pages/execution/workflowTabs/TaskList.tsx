import ReactDataGrid from "@inovua/reactdatagrid-community";
//import { ReactJson } from "../../../components";
import { TaskResult } from "../../../types/execution";
import { TypeColumns } from "@inovua/reactdatagrid-community/types/TypeColumn";
import { Tab } from "@mui/material";
import { TabPanel, TabContext, TabList } from "@mui/lab";
import GridOnIcon from '@mui/icons-material/TableRows';
import DataObjectIcon from '@mui/icons-material/DataObject';
import React from "react";
import { ReactJson } from "../../../components";
import { timestampRenderer } from "../../../utils/helpers";

export default function TaskList({
  tasks,
  workflowId,
}: {
  tasks: TaskResult[];
  workflowId: string;
}) {
  
  const columns: TypeColumns = [
    { name: "seq", header: "Seq", render: ({rowIndex}) => rowIndex+1, maxWidth: 60},
    { name: "taskId", header: "Task ID", defaultFlex: 1},
    { name: "referenceTaskName", header: "Task Ref", defaultFlex: 1 },
    { name: "taskDefName", header: "Def Name", defaultFlex: 1 },
    { name: "taskType", header: "Type", defaultFlex: 1 },
    { name: "scheduledTime", header: "Scheduled", render: renderTimestamp, defaultFlex: 1},
    { name: "startTime", header: "Start", render: renderTimestamp , defaultFlex: 1},
    { name: "endTime", header: "End", render: renderTimestamp , defaultFlex: 1},
    { name: "status", header: "Status", defaultFlex: 1},    
    { name: "iteration", header: "Iteration", defaultFlex: 1, defaultVisible: false},    
    { name: "retryCount", header: "Retries", defaultFlex: 1, defaultVisible: false},    
    { name: "correlationId", header: "Correlation ID", defaultFlex: 1, defaultVisible: false},    
    { name: "startDelayInSeconds", header: "Start Delay", defaultFlex: 1, defaultVisible: false},    
    { name: "responseTimeoutSeconds", header: "Response Timeout", defaultVisible: false },
    { name: "workflowPriority", header: "Workflow Priority", defaultVisible: false },
    { name: "queueWaitTime", header: "Queue Wait Time", defaultVisible: false },
    { name: "callbackAfterSeconds", header: "Callback After", defaultVisible: false },
    { name: "pollCount", header: "Poll Count", defaultVisible: false},

  ];
  const [ mode, setMode ] = React.useState("table");

  return (
    <div style={{height:"100%", width: "100%", display: 'flex', flexDirection: 'row'}}>
      <TabContext value={mode}>

      <TabList orientation="vertical" onChange={(event: React.SyntheticEvent, v: string) => setMode(v)}>
        <Tab icon={<GridOnIcon fontSize="small"/>} value="table" sx={{ minWidth: 50}}/>
        <Tab icon={<DataObjectIcon fontSize="small" />} value="json" sx={{ minWidth: 50}}/>
      </TabList>
      <TabPanel value="table" style={{flex: 1, padding: 0}}>
        <ReactDataGrid columns={columns} dataSource={tasks} 
          columnUserSelect
          showCellBorders="horizontal"
          idProperty="taskId"
          rowIndexColumn
          style={{height: '100%', flex: 1}}
          theme="conductor-light"
          //columnContextMenuConstrainTo={true}
          //columnContextMenuPosition={"fixed"}
          />
      </TabPanel>
      <TabPanel value="json" style={{flex: 1, padding: 0}}>
      <ReactJson
        src={tasks}
        label="Executed Tasks"
        path="tasks.json"
      />
      </TabPanel>
      </TabContext>
    </div>

    /*
    <DataTable
      style={{ minHeight: 400 }}
      data={tasks}
      columns={taskDetailFields}
      defaultShowColumns={[
        "seq",
        "taskId",
        "taskName",
        "referenceTaskName",
        "taskType",
        "startTime",
        "endTime",
        "status",
      ]}
      localStorageKey="taskListTable"
    />
    */
  );
}


function renderTimestamp({ value }: {value: any}){
  return timestampRenderer(value);
}