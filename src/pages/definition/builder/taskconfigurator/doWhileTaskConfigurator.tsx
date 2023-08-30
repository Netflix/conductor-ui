import { useCallback, useEffect, useState } from "react";
import { Button, Heading } from "../../../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

import JsonInput from "../../../../components/JsonInput";
import _ from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";
import { doWhileTaskSchema } from "../../../../schema/task/doWhileTask";

const taskFormStyle = {
  minHeight: 282.5,
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
          return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
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

const DOWHILETaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");

  const [inputExpression, setInputExpression] = useState<string>("");
  const [inputParameters, setInputParameters] = useState<string>("{}");

  // Datasources populated in useEffect below
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [loopCondition, setLoopCondition] = useState<string>("");

  // Initialize data sources and state
  useEffect(() => {
    // task level params
    let taskLevelParams = _.cloneDeep(doWhileTaskParameters);
    for (const param of taskLevelParams) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
    }
    setDataSource(taskLevelParams);

    // Initialize inputExpression
    const inputExpression = initialConfig.inputExpression?.expression;
    setInputExpression(inputExpression || "");

    const inputParameters = JSON.stringify(initialConfig.inputParameters);
    setInputParameters(inputParameters || "{}");

    if ("loopCondition" in initialConfig) {
      const loopCondition = initialConfig.loopCondition || "";
      setLoopCondition(loopCondition);
    }
    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  useEffect(() => {
    console.log("in useeffect");
    if (!initialConfig.inputExpression && !initialConfig.inputParameters) {
      return;
    } else if (!initialConfig.inputExpression)
      setParameterOrExpression("parameter");
    else if (!initialConfig.inputParameters)
      setParameterOrExpression("expression");
    else if (
      JSON.stringify(initialConfig.inputExpression).length >
      JSON.stringify(initialConfig.inputParameters).length
    ) {
      setParameterOrExpression("expression");
    } else setParameterOrExpression("parameter");
  }, [initialConfig.inputExpression, initialConfig.inputParameters]);

  const handleToggleButtonChange = (event, newSelection) => {
    setParameterOrExpression(newSelection);
  };
  console.log(parameterOrExpression);

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(initialConfig)!;

    mergeDataSourceIntoObject(dataSource, newTaskConfig);

    if (parameterOrExpression === "parameter") {
      newTaskConfig.inputParameters = JSON.parse(inputParameters);
      newTaskConfig.inputExpression = { type: "JSON_PATH", expression: "" };
      delete newTaskConfig["inputExpression"];
    } else if (parameterOrExpression === "expression") {
      newTaskConfig.inputExpression = {
        type: "JSON_PATH",
        expression: inputExpression,
      };
      delete newTaskConfig["inputParameters"];
    }

    if ("loopCondition" in newTaskConfig) {
      newTaskConfig.loopCondition = loopCondition;
    }

    console.log(newTaskConfig);

    onUpdate(newTaskConfig);
  }, [
    initialConfig,
    parameterOrExpression,
    onUpdate,
    inputExpression,
    inputParameters,
    loopCondition,
  ]);

  console.log(inputParameters);

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
        key="loopCondition"
        label="loopCondition"
        language="javascript"
        value={loopCondition}
        style={{ marginBottom: "15px" }}
        onChange={(v) => setLoopCondition(v!)}
      />

      <ToggleButtonGroup
        value={parameterOrExpression}
        exclusive
        onChange={handleToggleButtonChange}
        size="small"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="parameter">
          Define inputParameters statically (default)
        </ToggleButton>
        <ToggleButton value="expression">Use inputExpression</ToggleButton>
      </ToggleButtonGroup>

      {parameterOrExpression === "parameter" && (
        <JsonInput
          key="parameter"
          label="inputParameters"
          value={inputParameters}
          onChange={(v) => setInputParameters(v!)}
        />
      )}
      {parameterOrExpression === "expression" && (
        <JsonInput
          key="expression"
          label="inputExpression"
          language="plaintext"
          value={inputExpression}
          onChange={(v) => setInputExpression(v!)}
        />
      )}
    </div>
  );
};

export default DOWHILETaskConfigurator;

// Note: This mutates obj.
function mergeDataSourceIntoObject(data, obj) {
  data.forEach((item) => {
    if (item.type === "boolean") {
      if (item.value === "false" || item.value === false) {
        obj[item.key] = false;
      } else if (item.value === "true" || item.value === true) {
        obj[item.key] = true;
      } else {
        throw new TypeError("must be boolean");
      }
    } else if (item.type === "int" && item.value !== null) {
      obj[item.key] = parseInt(item.value.toString());
    } else {
      obj[item.key] = item.value;
    }
  });
}
