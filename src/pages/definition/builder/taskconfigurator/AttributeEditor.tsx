import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import { useCallback, useEffect, useState } from "react";
import {
  booleanEditorProps,
  dataSourceToObject,
  evaluatorTypeEditorProps,
  getRowStyle,
  terminationStatusEditorProps,
} from "./TaskConfiguratorUtils";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import { cloneDeep } from "lodash";

const taskFormStyle = (taskType) => {
  if (taskType === "TERMINATE") {
    return {
      minHeight: 362.5,
      margin: "15px 0",
    };
  } else if (taskType === "INLINE" || taskType === "SUB_WORKFLOW") {
    return {
      minHeight: 322.5,
      margin: "15px 0",
    };
  } else if (taskType === "JOIN" || taskType === "FORK_JOIN") {
    return {
      minHeight: 162.5,
      margin: "15px 0",
    };
  } else if (taskType === "FORK_JOIN_DYNAMIC") {
    return {
      minHeight: 242.5,
      margin: "15px 0",
    };
  } else if (taskType === "SWITCH") {
    return {
      minHeight: 202.5,
      margin: "15px 0",
    };
  } else
    return {
      minHeight: 282.5,
      margin: "15px 0",
    };
};

function AttributeEditor({
  schema,
  initialTaskLevelParams,
  onChange,
  taskType,
}) {
  const [dataSource, setDataSource] = useState<any[]>([]);

  const [gridRef, setGridRef] = useState<any>(null);
  const cellDOMProps = (cellProps) => {
    return {
      onClick: () => {
        if (gridRef)
          gridRef.current.startEdit({
            columnId: cellProps.id,
            rowIndex: cellProps.rowIndex,
          });
      },
    };
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
      cellDOMProps,
      render: ({ value }) => {
        if (value !== undefined && value !== null) return value.toString();
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
            } else if (data.key === "evaluatorType") {
              return (
                <SelectEditor
                  {...Props}
                  editorProps={evaluatorTypeEditorProps}
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

  useEffect(() => {
    // task level params
    let taskLevelParams = schema.map((item, index) => ({
      id: index,
      key: item.key,
      type: item.type,
      required: item.required,
      value: item.default,
    }));
    for (const param of taskLevelParams) {
      if (initialTaskLevelParams.hasOwnProperty(param.key)) {
        const newValue = initialTaskLevelParams[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
      if (
        (taskType === "TERMINAL" || taskType === "INLINE") &&
        initialTaskLevelParams.inputParameters.hasOwnProperty(param.key)
      ) {
        const newValue = initialTaskLevelParams.inputParameters[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      } else if (taskType === "SUB_WORKFLOW") {
        if (param.key === "subWorkflowParam.name") {
          const newValue = initialTaskLevelParams.subWorkflowParam["name"];
          if (param.value !== newValue) {
            param.value = newValue;
            param.changed = true;
          }
        } else if (param.key === "subWorkflowParam.version") {
          const newValue = initialTaskLevelParams.subWorkflowParam["version"];
          if (param.value !== newValue) {
            param.value = newValue;
            param.changed = true;
          }
        }
      }
    }
    setDataSource(taskLevelParams);
  }, [initialTaskLevelParams, schema, taskType]);

  const handleDataSource = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      const data = cloneDeep(dataSource)!;
      if (
        data[rowId][columnId].toString() === value.toString() ||
        (value.toString().length === 0 && data[rowId].required === true)
      )
        return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      const returnValue = {
        ...initialTaskLevelParams,
        ...dataSourceToObject(data, taskType),
      };
      setDataSource(data);
      onChange(returnValue);
    },
    [dataSource, initialTaskLevelParams, onChange, taskType],
  );

  return (
    <ReactDataGrid
      onReady={setGridRef}
      idProperty="id"
      style={taskFormStyle(taskType)}
      onEditComplete={handleDataSource}
      editable={true}
      columns={columns as any}
      dataSource={dataSource!}
      showCellBorders={true}
      theme="conductor-light"
      rowStyle={getRowStyle}
      showHeader={false}
    />
  );
}

export default AttributeEditor;
