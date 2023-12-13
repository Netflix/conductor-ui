import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import { useCallback, useMemo, useState } from "react";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import { GenericTaskConfig } from "../../../../types/workflowDef";
import { produce } from "immer";

type DecisionCasesEditorProps = {
  initialDecisionCases: any;
  onChange: (any) => void;
  style?: any;
};

function DecisionCasesEditor({
  initialDecisionCases,
  onChange,
  style,
}: DecisionCasesEditorProps) {
  const [gridRef, setGridRef] = useState<any>(null);
  const cellDOMProps = useCallback(
    (cellProps) => {
      return {
        onClick: (e) => {
          if (e.target.tagName === "DIV")
            gridRef.current.startEdit({
              columnId: cellProps.id,
              rowIndex: cellProps.rowIndex,
            });
        },
      };
    },
    [gridRef],
  );

  const columns = useMemo(
    () => [
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
        name: "caseValue",
        header: "Case Value",
        defaultFlex: 1,
        editable: true,
        cellDOMProps,
        render: ({ value }) => {
          if (value !== null) return value.toString();
          else return null;
        },
        renderEditor: (Props) => {
          return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
        },
      },
    ],
    [cellDOMProps],
  );

  const dataSource = useMemo(
    () =>
      Object.entries(initialDecisionCases).map(([key, tasks]) => {
        console.log(key, tasks);
        return {
          caseValue: key,
          taskReferenceName: (tasks as GenericTaskConfig[])[0]
            .taskReferenceName,
        };
      }),
    [initialDecisionCases],
  );

  const handleEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowIndex } = editInfo;

      const newDataSource = produce(dataSource, (draft) => {
        draft[rowIndex][columnId] = value;
      });

      const retval = {};
      for (const { caseValue, taskReferenceName } of newDataSource) {
        console.log(taskReferenceName, Object.values(initialDecisionCases));

        retval[caseValue] = Object.values(initialDecisionCases).find(
          (tasks) =>
            (tasks as GenericTaskConfig[])[0]?.taskReferenceName ===
            taskReferenceName,
        );
      }
      onChange(retval);
    },
    [dataSource, initialDecisionCases, onChange],
  );

  return (
    <div style={style}>
      <div style={{ fontWeight: "bold", fontSize: 13 }}>Decision Cases</div>
      <div style={{ marginBottom: 15 }}>
        Use the Workflow Builder to add or remove cases. The value of a case
        branch can be modified here.
      </div>
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="taskReferenceName"
        onEditComplete={handleEditComplete}
        editable={true}
        columns={columns}
        dataSource={dataSource!}
        showCellBorders={true}
        theme="conductor-light"
      />
    </div>
  );
}

export default DecisionCasesEditor;
