import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";

const booleanEditorProps = {
  dataSource: [
    { id: true, label: "true" },
    { id: false, label: "false" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

export default function BooleanEditor(props) {
  return <SelectEditor {...props} editorProps={booleanEditorProps} />;
}
