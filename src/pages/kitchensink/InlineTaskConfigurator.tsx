import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

const gridStyle = {
  minHeight: 442.5,
  margin: "15px 0"
};

const InlineTaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedJsonState, setUpdatedJsonState] = useState(initialConfig);

  const simpleTaskOptionalParameters = [
    {
      id: 0,
      key: "name",
      value: "",
      changed: false,
      required: true,
      type: "string",
    },
    {
      id: 1,
      key: "taskReferenceName",
      value: null,
      changed: false,
      required: true,
    },
    {
      id: 2,
      key: "description",
      value: "",
      changed: false,
      required: false,
      type: "string",
    },
    {
      id: 3,
      key: "optional",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 4,
      key: "asyncComplete",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 5,
      key: "startDelay",
      value: 0,
      changed: false,
      required: false,
      type: "int",
    },
    {
      id: 6,
      key: "rateLimited",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 7,
      key: "retryCount",
      value: 0,
      changed: false,
      required: false,
      type: "int",
    },
    {
        id: 8,
        key: "evaluatorType",
        value: "javascript",
        changed: false,
        required: true,
        type: "string",
      },
      {
        id: 9,
        key: "expression",
        value: "",
        changed: false,
        required: true,
        type: "string",
      },
  ];

  const renderCell = ({ value }) => {
    return value.toString();
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
        render: ({ value, data }) => {
          // Check if the key matches the conditions
          const displayValue =
            data.key === 'evaluatorType' || data.key === 'expression'
              ? `inputParameters.${value}`
              : value;
      
          return (
            <span>
              {data.changed ? (
                <span>
                  <span style={{ fontWeight: "bold" }}>{displayValue}</span>
                </span>
              ) : (
                displayValue
              )}
              {data.required ? <span style={{ color: "red" }}>*</span> : null}
            </span>
          );
        },
      },
    {
      name: "value",
      header: "Value",
      defaultFlex: 2,
      render: renderCell,
      renderEditor: (Props) => {
        const { data } = Props.cellProps;

        const booleanEditorProps = {
          idProperty: "id",
          dataSource: [
            { id: "true", label: "true" },
            { id: "false", label: "false" },
          ],
          collapseOnSelect: true,
          clearIcon: null,
        };

        const evaluatorTypeEditorProps = {
            idProperty: "id",
            dataSource: [
              { id: "value-param", label: "value-param" },
              { id: "javascript", label: "javascript" },
            ],
            collapseOnSelect: true,
            clearIcon: null,
          };

        switch (data.type) {
          case "int":
            return <NumericEditor {...Props} />;
          case "boolean":
            return <SelectEditor {...Props} editorProps={booleanEditorProps} />;
          default:
            if (data.key === "evaluatorType") {
                return <SelectEditor {...Props} editorProps={evaluatorTypeEditorProps} />;
            }
            else return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
        }
      },
    },
    { name: "changed", header: "Changed", defaultVisible: false },
    { name: "required", header: "Required", defaultVisible: false },
    { name: "type", header: "Type", defaultVisible: false },
  ];

  // eslint-disable-next-line
  useEffect(() => {
    let updatedParameters = [...simpleTaskOptionalParameters]; // Clone the array

    for (const param of updatedParameters) {
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
    setDataSource(updatedParameters);
    setUpdatedJsonState(initialConfig);
    // eslint-disable-next-line
  }, [initialConfig]);

  const [dataSource, setDataSource] = useState(simpleTaskOptionalParameters);

  // eslint-disable-next-line
  const onEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      if (!value) return;
      const data = [...dataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setDataSource(data);
      setRefreshKey(Math.random());

      const edittedJson = {};
      data.forEach((item) => {
        if (item.type === "boolean") {
          if (item.value === "false" || item.value === false)
            edittedJson[item.key] = false;
          else if (item.value === "true" || item.value === true)
            edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int") {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;
      });
      const originalObject = { ...updatedJsonState };

      // Step 2: Merge the properties from edittedJson into the original object
      for (const key in edittedJson) {
        
        if (key === 'evaluatorType' || key === 'expression') {
            console.log(originalObject.inputParameters[key]);
            console.log(edittedJson[key]);
            originalObject.inputParameters[key] = edittedJson[key];
        }
        else originalObject[key] = edittedJson[key];
      }

      setUpdatedJsonState(originalObject);
    },
    // eslint-disable-next-line
    [dataSource],
  );

  const handleSubmit = () => {
    onUpdate(updatedJsonState);
  };

  const getRowStyle = (data) => {
    if (data.data.changed) {
      return { backgroundColor: "#FFF" };
    }
    else return { backgroundColor:  "#F3F3F3" };
  };

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onEditComplete={onEditComplete}
        editable={true}
        columns={columns as any}
        dataSource={dataSource}
        showCellBorders={true}
        theme="conductor-light"
        key={refreshKey}
        rowStyle={getRowStyle}
        enableColumnAutosize={true}
      />
      <Button style={{ marginTop: "15px" }} onClick={handleSubmit}>
                Submit
              </Button>
    </div>
  );
};

export default InlineTaskConfigurator;
