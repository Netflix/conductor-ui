import ReactDataGrid from "@inovua/reactdatagrid-community";
import { useCallback, useMemo, useState } from "react";
import { produce } from "immer";
import ValueEditor from "./ValueEditor";
import { InterimSchemaField } from "../../../../schema/schemaUtils";
const ROW_HEIGHT = 40;

function headerRenderer({ value, data }) {
  return (
    <>
      {data.value !== data.defaultValue ? (
        <span style={{ fontWeight: "bold" }}>{value}</span>
      ) : (
        value
      )}
      {data.required ? <span style={{ color: "red" }}>*</span> : null}
    </>
  );
}

function getRowStyle(row) {
  if (row.data.value !== row.data.defaultValue) {
    return { backgroundColor: "#FFF" };
  } else return { backgroundColor: "#F3F3F3" };
}

type AttributeTableProps = {
  schema: InterimSchemaField[];
  config: any;
  style?: any;
  className?: any;
  onChange: (val: any) => void;
};

export default function AttributeTable({
  schema,
  config,
  style,
  className,
  onChange,
}: AttributeTableProps) {
  const [gridRef, setGridRef] = useState<any>(null);

  const cellDOMProps = useCallback(
    (cellProps) => {
      return {
        onClick: (e) => {
          if (gridRef && e.target.tagName === "DIV")
            gridRef.current.startEdit({
              columnId: cellProps.id,
              rowIndex: cellProps.rowIndex,
            });
        },
      };
    },
    [gridRef],
  );

  const dataSource = useMemo(() => {
    return schema
      .filter((field) => field.visible)
      .map((field) => {
        if (config?.hasOwnProperty(field.key)) {
          const configValue = config[field.key];
          return {
            ...field,
            value: configValue,
          };
        } else {
          return {
            ...field,
            value: field.defaultValue,
          };
        }
      });
  }, [schema, config]);

  const columns = useMemo(
    () => [
      {
        name: "key",
        header: "Key",
        defaultFlex: 1,
        minWidth: 250,
        editable: false,
        render: headerRenderer,
      },
      {
        name: "value",
        header: "Value",
        defaultFlex: 1,
        cellDOMProps: cellDOMProps,
        render: ({ value }) => {
          if (value !== null && value !== undefined) {
            return value.toString();
          } else {
            return null;
          }
        },
        editor: ValueEditor,
      },
    ],
    [cellDOMProps],
  );

  const height = dataSource.length * ROW_HEIGHT + 2;

  const handleEditComplete = useCallback(
    (editInfo) => {
      const { value, columnId, rowIndex, data } = editInfo;
      const newDataSource = produce(dataSource, (draft) => {
        if (data.type === "number") {
          const parsed = parseInt(value);

          draft[rowIndex][columnId] = isNaN(parsed) ? undefined : parsed;
        } else {
          draft[rowIndex][columnId] = value; // Note: columnId should always be 'value'.
        }
      });
      const retval = dataSourceToObject(newDataSource);

      // Restore alwayInclude fields
      const alwaysIncludeFields = schema.filter((field) => field.alwaysInclude);
      for (let field of alwaysIncludeFields) {
        if (!retval.hasOwnProperty(field.key)) {
          retval[field.key] = field.defaultValue;
        }
      }

      onChange(retval);
    },
    [dataSource, onChange, schema],
  );

  return (
    <ReactDataGrid
      className={className}
      style={{ ...style, minHeight: height }}
      onReady={setGridRef}
      idProperty="key"
      onEditComplete={handleEditComplete}
      editable={true}
      columns={columns as any}
      dataSource={dataSource}
      showCellBorders={true}
      theme="conductor-light"
      rowStyle={getRowStyle}
      showHeader={false}
    />
  );
}

function dataSourceToObject(dataSource) {
  let retval = {};

  for (const row of dataSource) {
    if (row.required || row.alwaysInclude || row.value !== row.defaultValue) {
      retval[row.key] = row.value;
    }
  }
  return retval;
}
