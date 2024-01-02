import ReactDataGrid from "@inovua/reactdatagrid-community";
import {
  TypeDataGridProps,
  TypeColumn,
} from "@inovua/reactdatagrid-community/types";
import { useCallback, useEffect, useMemo } from "react";
import useLocalStorageState from "use-local-storage-state";

type VisibleColumns = string[];

type DataGridProps = Omit<
  TypeDataGridProps,
  "onColumnVisibleChange" | "renderColumnContextMenu"
> & {
  localStorageKey: string;
};

function columnsToVisibleColumns(columns: TypeColumn[]) {
  return columns
    .filter((col) => col.defaultVisible !== false)
    .map((col) => col.name!);
}

function overrideLocalColumns(
  columns: TypeColumn[],
  visibleColumns: VisibleColumns,
) {
  return columns.map((col) => ({
    ...col,
    visible: visibleColumns.includes(col.name!),
  }));
}

export default function DataGrid(props: DataGridProps) {
  const { columns, ...rest } = props;

  const [visibleColumns, setVisibleColumns, { removeItem: restoreDefault }] =
    useLocalStorageState<VisibleColumns>(
      props.localStorageKey + "_visibleColumns",
      {
        defaultValue: columnsToVisibleColumns(columns),
      },
    );

  const renderColumnContextMenu = useCallback(
    (menuProps) => {
      menuProps.items = menuProps.items.concat([
        {
          label: "Reset Columns",
          onClick: () => {
            restoreDefault();
            menuProps.onDismiss();
          },
        },
      ]);
      return undefined;
    },
    [restoreDefault],
  );

  useEffect(() => {
    console.log(visibleColumns);
  }, [visibleColumns]);

  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);

  // merge visibleColumns into subsequence of matching columns while keeping order of other (invisible) columns the same
  const columnOrder = useMemo(() => {
    let visibleIdx = 0;
    const retval: string[] = [];
    for (let v of columns) {
      if (visibleSet.has(v.name!)) {
        retval.push(visibleColumns[visibleIdx++]);
      } else {
        retval.push(v.name!);
      }
    }

    return retval;
  }, [visibleSet, columns]);

  const localColumns = useMemo(
    () => overrideLocalColumns(columns, visibleColumns),
    [columns, visibleColumns],
  );

  function handleColumnVisibleChange({ column, visible }) {
    if (visible) {
      setVisibleColumns(
        columnOrder.filter((c) => visibleSet.has(c) || c === column.name),
      );
    } else {
      setVisibleColumns((vc) => vc.filter((v) => v !== column.name));
    }
  }

  function handleColumnOrderChange(columnOrder) {
    setVisibleColumns((visibleColumns) =>
      columnOrder.filter((col) => visibleColumns.includes(col)),
    );
  }

  return (
    <ReactDataGrid
      columns={localColumns}
      columnOrder={columnOrder}
      onColumnVisibleChange={handleColumnVisibleChange}
      onColumnOrderChange={handleColumnOrderChange}
      renderColumnContextMenu={renderColumnContextMenu}
      columnContextMenuConstrainTo={true}
      {...rest}
    />
  );
}

DataGrid.defaultProps = {
  ...ReactDataGrid.defaultProps,
  enableSelection: true,
  showCellBorders: "horizontal",
  style: { height: "100%", flex: 1 },
  theme: "conductor-light",
};
