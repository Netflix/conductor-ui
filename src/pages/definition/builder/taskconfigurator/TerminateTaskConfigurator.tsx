import { useCallback, useEffect, useState } from "react";
import { Button, Heading } from "../../../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { makeStyles } from "@mui/styles";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

import JsonInput from "../../../../components/JsonInput";
import _ from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { terminateTaskParameters } from "../../../../schema/task/terminateTask";

const taskFormStyle = {
  minHeight: 322.5,
  margin: "15px 0",
};

const useStyles = makeStyles({
  container: {
    margin: 15,
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

const booleanEditorProps = {
  idProperty: "id",
  dataSource: [
    { id: "true", label: "true" },
    { id: "false", label: "false" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

const terminationStatusEditorProps = {
  idProperty: "id",
  dataSource: [
    { id: "COMPLETED", label: "COMPLETED" },
    { id: "FAILED", label: "FAILED" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

const columns = [
  {
    name: "id",
    header: "Id",
    defaultVisible: false,
    minWidth: 300,
    type: "number",
  },
  {
    name: "key",
    header: "Key",
    defaultFlex: 1,
    minWidth: 250,
    editable: false,
    render: ({ value, data }) => (
      <span>
        {data.changed ? (
          <span>
            <span style={{ fontWeight: "bold" }}>{value}</span>
          </span>
        ) : (
          value
        )}
        {data.required ? <span style={{ color: "red" }}>*</span> : null}
      </span>
    ),
  },
  {
    name: "value",
    header: "Value",
    defaultFlex: 1,
    render: ({ value }) => {
      if (value !== null) return value.toString();
      else return null;
    },
    renderEditor: (Props) => {
      const { data } = Props.cellProps;

      switch (data.type) {
        case "int":
          return <NumericEditor {...Props} />;
        case "boolean":
          return <SelectEditor {...Props} editorProps={booleanEditorProps} />;
        default:
          if (data.key === "terminationStatus") {
            return (
              <SelectEditor
                {...Props}
                editorProps={terminationStatusEditorProps}
              />
            );
          } else return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
      }
    },
  },
  { name: "changed", header: "Changed", defaultVisible: false },
  { name: "required", header: "Required", defaultVisible: false },
  { name: "type", header: "Type", defaultVisible: false },
];

function getRowStyle(data) {
  if (data.data.changed) {
    return { backgroundColor: "#FFF" };
  } else return { backgroundColor: "#F3F3F3" };
}

const TerminateTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [workflowOutput, setWorkflowOutput] = useState<string>("{}");

  // Datasources populated in useEffect below
  const [dataSource, setDataSource] = useState<any[]>([]);

  // Initialize data sources and state
  useEffect(() => {
    // task level params
    let taskLevelParams = _.cloneDeep(terminateTaskParameters);
    for (const param of taskLevelParams) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
      if (initialConfig.inputParameters.hasOwnProperty(param.key)) {
        const newValue = initialConfig.inputParameters[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
    }
    setDataSource(taskLevelParams);

    const workflowOutput = JSON.stringify(
      initialConfig.inputParameters.workflowOutput,
    );
    setWorkflowOutput(workflowOutput || "{}");

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(initialConfig)!;

    mergeDataSourceIntoObject(dataSource, newTaskConfig);

    newTaskConfig.inputParameters.workflowOutput = JSON.parse(workflowOutput);

    console.log(newTaskConfig);

    onUpdate(newTaskConfig);
  }, [initialConfig, onUpdate, workflowOutput]);

  const handleDataSource = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      const data = _.cloneDeep(dataSource)!;
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;

      setDataSource(data);
      onChanged(true);
    },
    [dataSource, onChanged],
  );

  return (
    <div className={classes.container}>
      <div>
        <div style={{ float: "right" }}>
          <Button onClick={handleApply}>Apply</Button>
        </div>
        <Heading level={1} gutterBottom>
          SIMPLE Task
        </Heading>
      </div>
      <div>Double-click on value to edit</div>
      <ReactDataGrid
        idProperty="id"
        style={taskFormStyle}
        onEditComplete={handleDataSource}
        editable={true}
        columns={columns as any}
        dataSource={dataSource!}
        showCellBorders={true}
        theme="conductor-light"
        rowStyle={getRowStyle}
        showHeader={false}
      />

      <JsonInput
        key="workflowOutput"
        label="workflowOutput"
        value={workflowOutput}
        style={{ marginBottom: "15px" }}
        onChange={(v) => setWorkflowOutput(v!)}
      />
    </div>
  );
};

export default TerminateTaskConfigurator;

// Note: This mutates obj.
function mergeDataSourceIntoObject(data, obj) {
  const edittedJson = {};
  data.forEach((item) => {
    if (item.type === "boolean") {
      if (item.value === "false" || item.value === false) {
        edittedJson[item.key] = false;
      } else if (item.value === "true" || item.value === true) {
        edittedJson[item.key] = true;
      } else {
        throw new TypeError("must be boolean");
      }
    } else if (item.type === "int" && item.value !== null) {
      edittedJson[item.key] = parseInt(item.value.toString());
    } else {
      edittedJson[item.key] = item.value;
    }
  });
  for (const key in edittedJson) {
    if (key === "terminationStatus" || key === "terminationReason") {
      obj.inputParameters[key] = edittedJson[key];
    } else obj[key] = edittedJson[key];
  }
}
