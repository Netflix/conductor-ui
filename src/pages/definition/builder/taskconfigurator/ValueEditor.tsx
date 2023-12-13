import BooleanEditor from "./BooleanEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

const methodEditorProps = {
  dataSource: [
    { id: "GET", label: "GET" },
    { id: "PUT", label: "PUT" },
    { id: "POST", label: "POST" },
    { id: "DELETE", label: "DELETE" },
    { id: "OPTIONS", label: "OPTIONS" },
    { id: "HEAD", label: "HEAD" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

const contentTypeEditorProps = {
  dataSource: [
    { id: "text/plain", label: "text/plain" },
    { id: "text/html", label: "text/html" },
    { id: "application/json", label: "application/json" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

export default function ValueEditor(props) {
  const { data } = props.cellProps;

  if (data.type === "boolean") return <BooleanEditor {...props} />;
  else if (data.key === "method") {
    return <SelectEditor {...props} editorProps={methodEditorProps} />;
  } else if (data.key === "contentType") {
    return <SelectEditor {...props} editorProps={contentTypeEditorProps} />;
  } else {
    return <TextEditor {...props} />;
  }
}
