import ReactDataGrid from "@inovua/reactdatagrid-community";
import Paper from "../../components/Paper";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import StringFilter from "@inovua/reactdatagrid-community/StringFilter";
import NumberFilter from "@inovua/reactdatagrid-community/NumberFilter";
import DateFilter from "@inovua/reactdatagrid-community/DateFilter";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import { timestampRenderer } from "../../utils/helpers";

const columns = [
  {
    name: "name",
    header: "Name",
    minWidth: 50,
    defaultFlex: 2,
    filterEditor: StringFilter,
  },
  {
    name: "age",
    header: "Age",
    maxWidth: 1000,
    defaultFlex: 1,
    filterEditor: NumberFilter,
    editor: CustomEditor,
  },
  {
    name: "birthDate",
    header: "Birth Date",
    defaultFlex: 1,
    filterEditor: DateFilter,
    editor: TextEditor,
    render: ({ value }) => timestampRenderer(value),
  },
];

const defaultFilter = [
  { name: "name", operator: "contains", type: "string", value: "" },
  { name: "age", operator: "equals", type: "number", value: null },
  { name: "birthDate", operator: "gt", type: "date", value: null },
];

const gridStyle = { minHeight: 550 };
const today = new Date().getTime();
const dataSource = [
  { id: 1, name: "John McQueen", age: 35, birthDate: today },
  { id: 2, name: "Mary Stones", age: 25, birthDate: today },
  { id: 3, name: "Robert Fil", age: 27, birthDate: today },
  { id: 4, name: "Roger Robson", age: 81, birthDate: today },
  { id: 5, name: "Billary Konwik", age: 18, birthDate: today },
  { id: 6, name: "Bob Martin", age: 18, birthDate: today },
  { id: 7, name: "Matthew Richardson", age: 54, birthDate: today },
  { id: 8, name: "Ritchie Peterson", age: 54, birthDate: today },
  { id: 9, name: "Bryan Martin", age: 40, birthDate: today },
  { id: 10, name: "Mark Martin", age: 44, birthDate: today },
  { id: 11, name: "Michelle Sebastian", age: 24, birthDate: today },
  { id: 12, name: "Michelle Sullivan", age: 61, birthDate: today },
  { id: 13, name: "Jordan Bike", age: 16, birthDate: today },
  { id: 14, name: "Nelson Ford", age: 34, birthDate: today },
  { id: 15, name: "Tim Cheap", age: 3, birthDate: today },
  { id: 16, name: "Robert Carlson", age: 31, birthDate: today },
  { id: 17, name: "Johny Perterson", age: 40, birthDate: today },
];

export default () => (
  <Paper>
    <ReactDataGrid
      editable
      idProperty="id"
      columns={columns}
      dataSource={dataSource}
      style={gridStyle}
      theme="conductor-light"
      defaultFilterValue={defaultFilter}
    />
  </Paper>
);

function CustomEditor(props) {
  console.log(props);
  return props.cellProps.data.name === "John McQueen" ? (
    <TextEditor {...props} />
  ) : (
    <NumericEditor {...props} />
  );
}
