import BooleanEditor from "./BooleanEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

export default function ValueEditor(props) {
  const { data } = props.cellProps;
  if (data.type === "boolean") return <BooleanEditor {...props} />;
  else if (data.type === "select" && data.options) {
    const editorProps = {
      dataSource: data.options.map((option) => ({
        id: option,
        label: option,
      })),
      collapseOnSelect: true,
      clearIcon: null,
    };
    return (
      <SelectEditor
        collapseOnSelect
        clearIcon={null}
        {...props}
        editorProps={editorProps}
      />
    );
  } else {
    return <TextEditor {...props} />;
  }
}
