import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import { useCallback, useEffect, useState } from "react";
import {
  booleanEditorProps,
  dataSourceToObject,
  getRowStyle,
} from "./TaskConfiguratorUtils";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import { cloneDeep } from "lodash";
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

const taskFormStyle = {
  minHeight: 282.5,
  margin: "15px 0",
};

function AttributeEditor({ schema, initialTaskLevelParams, onChange }) {
  const [dataSource, setDataSource] = useState<any[]>([]);

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
    }
    setDataSource(taskLevelParams);

  }, [initialTaskLevelParams]);

  const handleDataSource = useCallback(
    (editInfo: TypeEditInfo) => {
      console.log("inside oneditcomplete");
      const { value, columnId, rowId } = editInfo;
      const data = cloneDeep(dataSource)!;
      if (
        data[rowId][columnId].toString() === value.toString() ||
        (value.toString().length == 0 && data[rowId].required === true)
      )
        return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      const returnValue = {
        ...initialTaskLevelParams,
        ...dataSourceToObject(data),
      };
      console.log("returnValue", returnValue);
      setDataSource(data);
      onChange(returnValue);
    },
    [dataSource],
  );
  console.log(dataSource);

  return (
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
  );
}

export default AttributeEditor;
