import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import { useCallback, useEffect, useState } from "react";
import {
  getRowStyle,
} from "./TaskConfiguratorUtils";
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
    name: "taskReferenceName",
    header: "taskReferenceName of the First Task in This Branch",
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
    header: "Key",
    defaultFlex: 1,
    editable: true,
    render: ({ value }) => {
      if (value !== null) return value.toString();
      else return null;
    },
    renderEditor: (Props) => {
      return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
    },
  },
  { name: "changed", header: "Changed", defaultVisible: false },
  { name: "required", header: "Required", defaultVisible: false },
];

const taskFormStyle = {
  minHeight: 162.5,
  margin: "15px 0",
};

function DecisionCasesEditor({ initialDecisionCases, onChange }) {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    // task level params

    const transformedData = Object.keys(initialDecisionCases).map(
      (key, index) => ({
        id: index,
        taskReferenceName: initialDecisionCases[key][0].taskReferenceName,
        value: key,
        changed: false,
        required: true,
        originalValue: key,
      }),
    );

    setDataSource(transformedData);
    setIsLoading(false); // Update loading state once data is populated
  }, [initialDecisionCases]);

  const handleDataSource = useCallback(
    (editInfo: TypeEditInfo) => {
      console.log("inside oneditcomplete");
      const { value, columnId, rowId } = editInfo;
      const data = cloneDeep(dataSource)!;
      if (
        data[rowId][columnId].toString() === value.toString() ||
        (value.toString().length === 0 && data[rowId].required === true)
      )
        return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      let returnValue = {};
      data.forEach((item) => {
        // Using existing tasks from originalObject, only updating the key
        returnValue[item.value] = initialDecisionCases[item.originalValue];
      });
      console.log("returnValue", returnValue);
      setDataSource(data);
      onChange(returnValue);
    },
    [dataSource, initialDecisionCases, onChange],
  );
  console.log(initialDecisionCases);
  console.log(dataSource);

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div>
      <div style={{ fontWeight: "bold", fontSize: 13 }}>decisionCases</div>
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
      />
    </div>
  );
}

export default DecisionCasesEditor;
