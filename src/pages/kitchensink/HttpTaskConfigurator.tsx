import { Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button, FormikJsonInput } from "../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

const gridStyle = {
  minHeight: 362.5,
  margin: "15px 0",
};

const HttpTaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [formState, setFormState] = useState({
    inputParameters: initialConfig.inputParameters
      ? JSON.stringify(initialConfig.inputParameters)
      : "{}",
    inputExpression:
      initialConfig.inputExpression && initialConfig.inputExpression.expression
        ? initialConfig.inputExpression.expression
        : "",
  });
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");
  const [updatedJsonState, setUpdatedJsonState] = useState(initialConfig);

  const simpleTaskOptionalParameters = [
    {
      id: 0,
      key: "name",
      value: "",
      changed: false,
      required: true,
      type: "string",
      level: "task"
    },
    {
      id: 1,
      key: "taskReferenceName",
      value: "",
      changed: false,
      required: true,
      level: "task"
    },
    {
      id: 2,
      key: "description",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "task"
    },
    {
      id: 3,
      key: "optional",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task"
    },
    {
      id: 4,
      key: "asyncComplete",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task"
    },
    {
      id: 5,
      key: "startDelay",
      value: 0,
      changed: false,
      required: false,
      type: "int",
      level: "task"
    },
    {
      id: 6,
      key: "rateLimited",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task"
    },
    {
      id: 7,
      key: "retryCount",
      value: 0,
      changed: false,
      required: false,
      type: "int",
      level: "task"
    },
    {
      id: 8,
      key: "asyncCompleteExpression",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "inputParameters"
    },
    {
      id: 9,
      key: "uri",
      value: "",
      changed: false,
      required: true,
      type: "string",
      level: "http_request"
    },
    {
      id: 10,
      key: "method",
      value: "GET",
      changed: false,
      required: true,
      type: "string",
      level: "http_request"
    },
    {
      id: 11,
      key: "accept",
      value: "application/json",
      changed: false,
      required: false,
      type: "string",
      level: "http_request"
    },
    {
      id: 12,
      key: "contentType",
      value: "application/json",
      changed: false,
      required: false,
      type: "string",
      level: "http_request"
    },
    {
      id: 13,
      key: "vipAddress",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "http_request"
    },
    {
      id: 14,
      key: "appName",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "http_request"
    },
  ];

  const renderCell = ({ value }) => {
    if (value !== null)
    return value.toString();
    else return null;
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
      render: renderCell,
      renderEditor: (Props) => {
        const { data } = Props.cellProps;
        console.log(Props);

        const methodEditorProps = {
          idProperty: "id",
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
          idProperty: "id",
          dataSource: [
            { id: "text/plain", label: "Gtext/plain" },
            { id: "text/html", label: "text/html" },
            { id: "application/json", label: "application/json" },
          ],
          collapseOnSelect: true,
          clearIcon: null,
        };

        const booleanEditorProps = {
          idProperty: "id",
          dataSource: [
            { id: "true", label: "true" },
            { id: "false", label: "false" },
          ],
          collapseOnSelect: true,
          clearIcon: null,
        };

        switch (data.type) {
          case "int":
            return <NumericEditor {...Props} />;
          case "boolean":
            return <SelectEditor {...Props} editorProps={booleanEditorProps} />;
          default:
            if (data.key === "method") {
              return (
                <SelectEditor {...Props} editorProps={methodEditorProps} />
              );
            } else if (data.key === "contentType") {
              return (
                <SelectEditor {...Props} editorProps={contentTypeEditorProps} />
              );
            } else return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
        }
      },
    },
    { name: "changed", header: "Changed", defaultVisible: false },
    { name: "required", header: "Required", defaultVisible: false },
    { name: "type", header: "Type", defaultVisible: false },
    { name: "level", header: "Level", defaultVisible: false },
  ];

  const headersColumns = [
    {
      name: "id",
      header: "Id",
      defaultVisible: false,
      minWidth: 300,
    },
    {
      name: "key",
      header: "Key",
      defaultFlex: 1,
      minWidth: 250,
      editable: false,
    },
    {
      name: "value",
      header: "Value",
      defaultFlex: 2,
    },
  ];

  // eslint-disable-next-line
  useEffect(() => {
    let updatedParameters = [...simpleTaskOptionalParameters]; // Clone the array

    for (const param of updatedParameters) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }

      if (
        initialConfig.inputParameters.http_request &&
        initialConfig.inputParameters.http_request.hasOwnProperty(param.key)
      ) {
        const newValue = initialConfig.inputParameters.http_request[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
    }

    if (initialConfig.inputParameters.hasOwnProperty("asyncComplete")) {
      const newValue = initialConfig.inputParameters["asyncComplete"];
      if (updatedParameters["asyncCompleteExpression"].value !== newValue) {
        updatedParameters["asyncCompleteExpression"].value = newValue;
        updatedParameters["asyncCompleteExpression"].changed = true;
      }
    }
    setDataSource(updatedParameters);
    setUpdatedJsonState(initialConfig);
    // eslint-disable-next-line
  }, [initialConfig]);

  const [dataSource, setDataSource] = useState(simpleTaskOptionalParameters);

  const [headersDataSource, setHeadersDataSource] = useState<any>([]);

  // eslint-disable-next-line
  useEffect(() => {
    const headers = initialConfig.inputParameters.http_request.headers;

    // Convert headers to the desired format
    const newRows = Object.entries(headers).map(([key, value], index) => {
        return {
            id: index + 1, // You can adjust this if you need different ID logic
            key: key,
            value: value,
        };
    });

    // Update the state with the new rows
    setHeadersDataSource(newRows);
}, [initialConfig.inputParameters.http_request.headers]);

  // eslint-disable-next-line
  const onEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      if (!value) return;
      const data = [...dataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setDataSource(data);
      setRefreshKey(Math.random());

      const originalObject = { ...updatedJsonState };

      const edittedJson = {};
      data.forEach((item) => {
        if (item.type === "boolean") {
          if (item.value === "false" || item.value === false)
            edittedJson[item.key] = false;
          else if (item.value === "true" || item.value === true)
            edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int" && item.value !== null) {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;

        if (item.level == 'task')
        originalObject[item.key] = edittedJson[item.key];
        else if (item.level == 'inputParameters')
        originalObject.inputParameters[item.key] = edittedJson[item.key];
        else {
            console.log(edittedJson[item.key]);
            originalObject.inputParameters.http_request[item.key] = edittedJson[item.key];
        }
      });

      setUpdatedJsonState(originalObject);
      console.log("edited", initialConfig);
    },
    // eslint-disable-next-line
    [dataSource],
  );

  const onHeadersEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      console.log(value);
      if (!value) return;
      const data = [...headersDataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setHeadersDataSource(data);
      setRefreshKey(Math.random());

      const edittedJson = {};
      data.forEach((item) => {
        edittedJson[item.key] = item.value;
      });
      const originalObject = { ...updatedJsonState };

      originalObject.inputParameters.http_request.headers = edittedJson;

      setUpdatedJsonState(originalObject);
      console.log("edited", initialConfig);
    },
    // eslint-disable-next-line
    [headersDataSource],
  );

  const handleSubmit = (values) => {
    // setFormState(values);
    // let newJsonState;
    // if (parameterOrExpression === "expression") {
    //   newJsonState = {
    //     ...updatedJsonState,
    //     inputExpression: {
    //       expression: values.inputExpression,
    //       type: "JSON_PATH",
    //     },
    //     inputParameters: {},
    //   };
    // } else {
    //   newJsonState = {
    //     ...updatedJsonState,
    //     inputParameters: JSON.parse(values.inputParameters),
    //     inputExpression: {},
    //   };
    // }
    setUpdatedJsonState(updatedJsonState);
    onUpdate(updatedJsonState);
  };

  const getRowStyle = (data) => {
    if (data.data.changed) {
      return { backgroundColor: "#FFF" };
    } else return { backgroundColor: "#F3F3F3" };
  };

  console.log(formState);

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onEditComplete={onEditComplete}
        editable={true}
        columns={columns as any}
        dataSource={dataSource}
        showCellBorders={true}
        theme="conductor-light"
        key={refreshKey}
        rowStyle={getRowStyle}
      />

      <ReactDataGrid
        idProperty="id"
        //style={gridStyle}
        onEditComplete={onHeadersEditComplete}
        editable={true}
        columns={headersColumns as any}
        dataSource={headersDataSource}
        showCellBorders={true}
        theme="conductor-light"
        //key={refreshKey}
        rowStyle={getRowStyle}
      />
      <Formik
        initialValues={formState}
        onSubmit={(values) => handleSubmit(values)}
        enableReinitialize={true}
      >
        {() => {
          return (
            <Form>
              <FormikJsonInput
                key="parameter"
                label="inputParameters"
                name="inputParameters"
                className={undefined}
                height={undefined}
              />
              <Button style={{ marginTop: "15px" }} type="submit">
                Submit
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default HttpTaskConfigurator;
