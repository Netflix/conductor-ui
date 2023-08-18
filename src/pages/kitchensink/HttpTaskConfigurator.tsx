import { Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button, FormikJsonInput, Heading } from "../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";

const taskFormStyle = {
  minHeight: 402.5,
  margin: "15px 0",
};

const httpRequestFormStyle = {
  minHeight: 282.5,
  margin: "15px 0",
};

const HttpTaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [httpRequestExpressionState, setHttpRequestExpressionState] = useState({
    expression: initialConfig.inputParameters.http_request,
  });
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");
  const [updatedJsonState, setUpdatedJsonState] = useState(initialConfig);
  const [contentType, setContentType] = useState("application/json");
  const [httpRequestBody, setHttpRequestBody] = useState({ body: "{}" });

  const simpleTaskOptionalParameters = [
    {
      id: 0,
      key: "name",
      value: "",
      changed: false,
      required: true,
      type: "string",
      level: "task",
    },
    {
      id: 1,
      key: "taskReferenceName",
      value: "",
      changed: false,
      required: true,
      level: "task",
    },
    {
      id: 2,
      key: "description",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "task",
    },
    {
      id: 3,
      key: "optional",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task",
    },
    {
      id: 4,
      key: "asyncComplete",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task",
    },
    {
      id: 5,
      key: "startDelay",
      value: 0,
      changed: false,
      required: false,
      type: "int",
      level: "task",
    },
    {
      id: 6,
      key: "rateLimited",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
      level: "task",
    },
    {
      id: 7,
      key: "retryCount",
      value: 0,
      changed: false,
      required: false,
      type: "int",
      level: "task",
    },
    {
      id: 8,
      key: "asyncCompleteExpression",
      value: "false",
      changed: false,
      required: false,
      type: "string",
      level: "inputParameters",
    },
  ];

  const httpRequestParameters = [
    {
      id: 0,
      key: "uri",
      value: "",
      changed: false,
      required: true,
      type: "string",
      level: "http_request",
    },
    {
      id: 1,
      key: "method",
      value: "GET",
      changed: false,
      required: true,
      type: "string",
      level: "http_request",
    },
    {
      id: 2,
      key: "accept",
      value: "application/json",
      changed: false,
      required: false,
      type: "string",
      level: "http_request",
    },
    {
      id: 3,
      key: "contentType",
      value: "application/json",
      changed: false,
      required: false,
      type: "string",
      level: "http_request",
    },
    {
      id: 4,
      key: "vipAddress",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "http_request",
    },
    {
      id: 5,
      key: "appName",
      value: "",
      changed: false,
      required: false,
      type: "string",
      level: "http_request",
    },
  ];

  const renderCell = ({ value }) => {
    if (value !== null) return value.toString();
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
            { id: "text/plain", label: "text/plain" },
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
    },
    {
      name: "value",
      header: "Value",
      defaultFlex: 2,
    },
  ];

  const [httpRequestDataSource, setHttpRequestDataSource] = useState(
    httpRequestParameters,
  );

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
    }

    let updatedHttpRequestParameters = [...httpRequestParameters];
    for (const param of updatedHttpRequestParameters) {
      if (
        initialConfig.inputParameters.http_request &&
        typeof initialConfig.inputParameters.http_request !== "string" &&
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
    setHttpRequestDataSource(updatedHttpRequestParameters);
    setUpdatedJsonState(initialConfig);
    // eslint-disable-next-line
  }, [initialConfig]);

  const [dataSource, setDataSource] = useState(simpleTaskOptionalParameters);

  const [headersDataSource, setHeadersDataSource] = useState<any>([]);

  // eslint-disable-next-line
  useEffect(() => {
    if (
      typeof initialConfig.inputParameters.http_request === "string" ||
      !initialConfig.inputParameters.http_request.headers
    ) {
      setHeadersDataSource([]);
      return;
    }
    const headers = initialConfig.inputParameters.http_request.headers;

    // Convert headers to the desired format
    const newRows = Object.entries(headers).map(([key, value], index) => {
      return {
        id: index, // You can adjust this if you need different ID logic
        key: key,
        value: value,
      };
    });

    // Update the state with the new rows
    setHeadersDataSource(newRows);
  }, [initialConfig.inputParameters.http_request.headers]);

  useEffect(() => {
    if (!initialConfig.inputParameters.http_request.body) {
      setHttpRequestBody({ body: "{}" });
      return;
    } else {
      if (typeof initialConfig.inputParameters.http_request.body === "string") {
        setHttpRequestBody({
          body: initialConfig.inputParameters.http_request.body,
        });
      } else {
        setHttpRequestBody({
          body: JSON.stringify(initialConfig.inputParameters.http_request.body),
        });
      }
    }
  }, [initialConfig.inputParameters.http_request.body]);

  useEffect(() => {
    if (!initialConfig.inputParameters.http_request.contentType) {
      setContentType("application/json");
      return;
    }
    setContentType(initialConfig.inputParameters.http_request.contentType);
  }, [initialConfig.inputParameters.http_request.contentType]);

  // eslint-disable-next-line
  const onEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      //if (!value) return;
      const data = [...dataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setDataSource(data);
      setRefreshKey(Math.random());

      const originalObject = JSON.parse(JSON.stringify(updatedJsonState));

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
        if (item.level === "task")
          originalObject[item.key] = edittedJson[item.key];
        else if (item.key === "asyncCompleteExpression")
          originalObject.inputParameters["asyncComplete"] =
            edittedJson[item.key];
        else {
          originalObject.inputParameters.http_request[item.key] =
            edittedJson[item.key];
        }
      });

      setUpdatedJsonState(originalObject);
    },
    // eslint-disable-next-line
    [dataSource],
  );

  const onHttpRequestEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      //if (!value) return;
      const data = [...httpRequestDataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setHttpRequestDataSource(data);
      setRefreshKey(Math.random());

      const originalObject = JSON.parse(JSON.stringify(updatedJsonState));

      const edittedJson = {};
      data.forEach((item) => {
        if (item.type === "boolean") {
          if (item.value === "false") edittedJson[item.key] = false;
          else if (item.value === "true") edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int" && item.value !== null) {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;

        if (item.key === "contentType") {
          setContentType(item.value);
        }

        if (item.level == "task")
          originalObject[item.key] = edittedJson[item.key];
        else if (item.level == "inputParameters")
          originalObject.inputParameters[item.key] = edittedJson[item.key];
        else {
          originalObject.inputParameters.http_request[item.key] =
            edittedJson[item.key];
        }
      });

      setUpdatedJsonState(originalObject);
    },
    // eslint-disable-next-line
    [httpRequestDataSource],
  );

  const onHeadersEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      //if (!value) return;
      const data = [...headersDataSource];
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;
      setHeadersDataSource(data);
      setRefreshKey(Math.random());

      const edittedJson = {};
      data.forEach((item) => {
        if (item.key !== "") edittedJson[item.key] = item.value;
      });
      const originalObject = JSON.parse(JSON.stringify(updatedJsonState));

      originalObject.inputParameters.http_request.headers = edittedJson;

      setUpdatedJsonState(originalObject);
    },
    // eslint-disable-next-line
    [headersDataSource],
  );

  useEffect(() => {
    if (typeof initialConfig.inputParameters.http_request === "string") {
      setParameterOrExpression("expression");
      setHttpRequestExpressionState({
        expression: initialConfig.inputParameters.http_request,
      });
    } else setParameterOrExpression("parameter");
  }, [initialConfig.inputParameters.http_request]);

  const handleHttpExpressionSubmit = (values) => {
    setHttpRequestExpressionState(values);
    let newJsonState;
    let newInputParameters;
    newInputParameters = {
      ...updatedJsonState.inputParameters,
      http_request: values.expression,
    };
    newJsonState = {
      ...updatedJsonState,
      inputParameters: newInputParameters,
    };

    setUpdatedJsonState(newJsonState);
    onUpdate(newJsonState);
  };

  const handleHttpParametersSubmit = (values) => {
    setHttpRequestBody(values);
    let newJsonState;
    let newHttpRequest;
    let newInputParameters;

    let bodyValue = values.body;
    if (contentType === "application/json") bodyValue = JSON.parse(values.body);
    console.log("contenttype", contentType);
    console.log("bodyvalue", bodyValue);
    newHttpRequest = {
      ...updatedJsonState.inputParameters.http_request,
      body: bodyValue,
    };
    newInputParameters = {
      ...updatedJsonState.inputParameters,
      http_request: newHttpRequest,
    };
    newJsonState = {
      ...updatedJsonState,
      inputParameters: newInputParameters,
    };

    setUpdatedJsonState(newJsonState);
    onUpdate(newJsonState);
  };

  const getRowStyle = (data) => {
    if (data.data.changed) {
      return { backgroundColor: "#FFF" };
    } else return { backgroundColor: "#F3F3F3" };
  };

  const handleAddEmptyRow = () => {
    const emptyRow = { id: headersDataSource.length, key: "", value: "" };
    setHeadersDataSource((oldData) => [...oldData, emptyRow]);
  };

  const handleToggleButtonChange = (event, newSelection) => {
    if (newSelection) {
      clearFormValues(); // Clear the form values
      setParameterOrExpression(newSelection);
      let newJsonState;
      let newInputParameters;
      let newValue = "" as any;
      if (newSelection === "parameter") newValue = {};
      newInputParameters = {
        ...updatedJsonState.inputParameters,
        http_request: newValue,
      };
      newJsonState = {
        ...updatedJsonState,
        inputParameters: newInputParameters,
      };

      setUpdatedJsonState(newJsonState);
      setDataSource(simpleTaskOptionalParameters);
      setHttpRequestDataSource(httpRequestParameters);
      setHeadersDataSource([]);
      setHttpRequestBody({ body: "{}" });
    }
  };

  const clearFormValues = () => {
    const newFormValues = {
      expression: "",
    };

    setHttpRequestExpressionState(newFormValues); // Clear the form values
  };

  console.log(httpRequestBody);
  return (
    <div>
      <Heading level={1} gutterBottom>
        Task Configuration
      </Heading>
      <ReactDataGrid
        idProperty="id"
        style={taskFormStyle}
        onEditComplete={onEditComplete}
        editable={true}
        columns={columns as any}
        dataSource={dataSource}
        showCellBorders={true}
        theme="conductor-light"
        key={refreshKey}
        rowStyle={getRowStyle}
      />

      <ToggleButtonGroup
        value={parameterOrExpression}
        exclusive
        onChange={handleToggleButtonChange}
        aria-label="toggle between parameter and expression"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="parameter" aria-label="use parameter">
          Use Json Parameters for Http_request
        </ToggleButton>
        <ToggleButton value="expression" aria-label="use expression">
          Use Json Expression For Http_request
        </ToggleButton>
      </ToggleButtonGroup>

      {parameterOrExpression === "parameter" ? (
        <div>
          <Heading level={1} gutterBottom>
            inputParameters.http_request Configuration
          </Heading>
          <ReactDataGrid
            idProperty="id"
            style={httpRequestFormStyle}
            onEditComplete={onHttpRequestEditComplete}
            editable={true}
            columns={columns as any}
            dataSource={httpRequestDataSource}
            showCellBorders={true}
            theme="conductor-light"
            //key={refreshKey}
            rowStyle={getRowStyle}
          />
          <Heading level={1} gutterBottom>
            inputParameters.http_request.headers Configuration
          </Heading>
          <Button style={{ margin: "15px" }} onClick={handleAddEmptyRow}>
            Add New Row
          </Button>
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
            initialValues={httpRequestBody}
            onSubmit={(values) => handleHttpParametersSubmit(values)}
            enableReinitialize={true}
          >
            {() => {
              return (
                <Form>
                  {contentType === "application/json" ? (
                    <FormikJsonInput
                      key="body"
                      label="inputParameters.http_request.body"
                      name="body"
                      className={undefined}
                      height={undefined}
                    />
                  ) : (
                    <FormikJsonInput
                      key="body"
                      label="inputParameters.http_request.body"
                      name="body"
                      className={undefined}
                      height={undefined}
                      language="plaintext"
                    />
                  )}

                  <Button style={{ margin: "60px" }} type="submit">
                    Submit
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </div>
      ) : (
        <Formik
          initialValues={httpRequestExpressionState}
          onSubmit={(values) => handleHttpExpressionSubmit(values)}
          enableReinitialize={true}
        >
          {() => {
            return (
              <Form>
                <FormikJsonInput
                  key="expression"
                  label="http_request Expression"
                  name="expression"
                  className={undefined}
                  height={undefined}
                  language="plaintext"
                />

                <Button style={{ marginTop: "15px" }} type="submit">
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      )}
    </div>
  );
};

export default HttpTaskConfigurator;
