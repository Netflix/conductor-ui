import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Heading } from "../../../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import {
  httpTaskLevelParameters,
  httpRequestParameters,
} from "../../../../schema/task/httpTask";
import JsonInput from "../../../../components/JsonInput";
import _ from "lodash";
import { Add } from "@mui/icons-material";
import { TaskConfiguratorProps } from "../TaskConfigPanel";

const taskFormStyle = {
  minHeight: 362.5,
  margin: "15px 0",
};

const httpRequestFormStyle = {
  minHeight: 242.5,
  margin: "15px 0",
};

const useStyles = makeStyles({
  container: {
    margin: 15,
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

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

function getRowStyle(data) {
  if (data.data.changed) {
    return { backgroundColor: "#FFF" };
  } else return { backgroundColor: "#F3F3F3" };
}

const HttpTaskConfigurator = ({
  initialConfig,
  onUpdate,
  onChanged,
}: TaskConfiguratorProps) => {
  const classes = useStyles();
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");

  const [httpRequestBody, setHttpRequestBody] = useState<string>("{}");
  const [inputExpression, setInputExpression] = useState<string>("");

  // Datasources populated in useEffect below
  const [taskLevelDataSource, setTaskLevelDataSource] = useState<any[]>();
  const [httpRequestDataSource, setHttpRequestDataSource] = useState<any[]>();
  const [headersDataSource, setHeadersDataSource] = useState<any[]>([]);

  const [gridRef, setGridRef] = useState<any>(null);
  const cellDOMProps = (cellProps) => {
    return {
      onClick: () => {
        if (gridRef)
          gridRef.current.startEdit({
            columnId: cellProps.id,
            rowIndex: cellProps.rowIndex,
          });
      },
    };
  };

  const contentType = useMemo(
    () =>
      httpRequestDataSource?.find((row) => row.key === "contentType")?.value,
    [httpRequestDataSource],
  );

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
      cellDOMProps,
      render: ({ value }) => {
        if (value !== null) return value.toString();
        else return null;
      },
      renderEditor: (Props) => {
        const { data } = Props.cellProps;

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

  // Initialize data sources and state
  useEffect(() => {
    // task level params
    let taskLevelParams = _.cloneDeep(httpTaskLevelParameters);
    for (const param of taskLevelParams) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      } else if (
        param.key === "asyncCompleteExpression" &&
        initialConfig.inputParameters.hasOwnProperty("asyncComplete")
      ) {
        const newValue = initialConfig.inputParameters["asyncComplete"];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
    }
    setTaskLevelDataSource(taskLevelParams);

    // http_request
    let httpRequestParams = _.cloneDeep(httpRequestParameters);
    for (const param of httpRequestParams) {
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
    setHttpRequestDataSource(httpRequestParams);

    // Headers
    const headers = initialConfig.inputParameters?.http_request?.headers;
    if (headers) {
      const rows = Object.entries(headers).map(([key, value], index) => {
        return {
          id: index,
          key: key,
          value: value,
        };
      });
      setHeadersDataSource(rows);
    } else {
      setHeadersDataSource([]);
    }

    // Request body
    const body = initialConfig.inputParameters?.http_request?.body;
    if (body) {
      if (typeof body === "string") {
        setHttpRequestBody(initialConfig.inputParameters.http_request.body);
      } else {
        setHttpRequestBody(
          JSON.stringify(initialConfig.inputParameters.http_request.body),
        );
      }
    } else {
      setHttpRequestBody("{}");
    }

    // Initialize inputExpression
    const inputExpression = initialConfig.inputExpression?.expression;
    setInputExpression(inputExpression || "");

    // Reset changed
    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleTaskLevelDataSource = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      const data = _.cloneDeep(taskLevelDataSource)!;
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;

      setTaskLevelDataSource(data);
      onChanged(true);
    },
    [taskLevelDataSource, onChanged],
  );

  const handleHttpRequestDataSource = (value) => {
    setHttpRequestDataSource(value);
    onChanged(true);
  };

  const handleHeadersDataSource = (value) => {
    setHeadersDataSource(value);
    onChanged(true);
  };

  const handleHttpRequestBody = (value) => {
    setHttpRequestBody(value);
    onChanged(true);
  };

  const handleToggleButtonChange = (event, newSelection) => {
    setParameterOrExpression(newSelection);
  };

  const handleApply = useCallback(() => {
    const newTaskConfig = _.cloneDeep(initialConfig)!;

    mergeDataSourceIntoObject(taskLevelDataSource, newTaskConfig);

    if (parameterOrExpression === "parameter") {
      newTaskConfig.inputParameters = {};
      // Make sure http_request exist before merge
      if (!newTaskConfig.inputParameters.http_request) {
        newTaskConfig.inputParameters.http_request = {};
      }

      mergeDataSourceIntoObject(
        httpRequestDataSource,
        newTaskConfig.inputParameters.http_request,
      );

      // Make sure headers exist before merge
      if (!newTaskConfig.inputParameters.http_request?.headers) {
        newTaskConfig.inputParameters.http_request.headers = {};
      }

      mergeDataSourceIntoObject(
        headersDataSource,
        newTaskConfig.inputParameters.http_request.headers,
      );

      // Request body
      // This will always serialize parsable json into an object (Map)
      let parsedBody;
      if (contentType === "application/json") {
        try {
          parsedBody = JSON.parse(httpRequestBody!);
        } catch (e) {
          parsedBody = httpRequestBody;
        }
      } else {
        parsedBody = httpRequestBody;
      }
      newTaskConfig.inputParameters.http_request.body = parsedBody;
    } else if (parameterOrExpression === "expression") {
      newTaskConfig.inputExpression = {
        type: "JSON_PATH",
        expression: inputExpression,
      };
    }

    onUpdate(newTaskConfig);
  }, [
    initialConfig,
    taskLevelDataSource,
    parameterOrExpression,
    onUpdate,
    httpRequestDataSource,
    headersDataSource,
    contentType,
    httpRequestBody,
    inputExpression,
  ]);

  if (
    !taskLevelDataSource ||
    !httpRequestDataSource ||
    !headersDataSource ||
    !httpRequestBody
  )
    return null;

  return (
    <div className={classes.container}>
      <div>
        <div style={{ float: "right" }}>
          <Button onClick={handleApply}>Apply</Button>
        </div>
        <Heading level={1} gutterBottom>
          HTTP Task
        </Heading>
      </div>
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="id"
        style={taskFormStyle}
        onEditComplete={handleTaskLevelDataSource}
        editable={true}
        columns={columns as any}
        dataSource={taskLevelDataSource!}
        showCellBorders={true}
        theme="conductor-light"
        rowStyle={getRowStyle}
        showHeader={false}
      />

      <ToggleButtonGroup
        value={parameterOrExpression}
        exclusive
        onChange={handleToggleButtonChange}
        size="small"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="parameter">
          Define inputParameters statically (default)
        </ToggleButton>
        <ToggleButton value="expression">Use inputExpression</ToggleButton>
      </ToggleButtonGroup>

      {parameterOrExpression === "parameter" && (
        <HttpRequestConfigurator
          httpRequestDataSource={httpRequestDataSource}
          setHttpRequestDataSource={handleHttpRequestDataSource}
          headersDataSource={headersDataSource}
          setHeadersDataSource={handleHeadersDataSource}
          httpRequestBody={httpRequestBody}
          setHttpRequestBody={handleHttpRequestBody}
          contentType={contentType}
        />
      )}
      {parameterOrExpression === "expression" && (
        <JsonInput
          key="expression"
          label="inputExpression"
          language="plaintext"
          value={inputExpression}
          onChange={(v) => setInputExpression(v!)}
        />
      )}
    </div>
  );
};

export default HttpTaskConfigurator;

function HttpRequestConfigurator({
  httpRequestDataSource,
  setHttpRequestDataSource,
  headersDataSource,
  setHeadersDataSource,
  httpRequestBody,
  setHttpRequestBody,
  contentType,
}) {
  const classes = useStyles();

  const [gridRef, setGridRef] = useState<any>(null);
  const cellDOMProps = (cellProps) => {
    return {
      onClick: () => {
        gridRef.current.startEdit({
          columnId: cellProps.id,
          rowIndex: cellProps.rowIndex,
        });
      },
    };
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
      cellDOMProps,
      render: ({ value }) => {
        if (value !== null) return value.toString();
        else return null;
      },
      renderEditor: (Props) => {
        const { data } = Props.cellProps;

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

  const onHeadersEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;

      const data = _.cloneDeep(headersDataSource);
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;

      const edittedJson = {};
      data.forEach((item) => {
        if (item.key !== "") edittedJson[item.key] = item.value;
      });

      setHeadersDataSource(data);
    },
    [headersDataSource, setHeadersDataSource],
  );

  const onHttpRequestEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      const data = _.cloneDeep(httpRequestDataSource)!;

      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;

      const edittedJson = {};
      data.forEach((item) => {
        if (item.type === "boolean") {
          if (item.value === "false") edittedJson[item.key] = false;
          else if (item.value === "true") edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int" && item.value !== null) {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;
      });

      setHttpRequestDataSource(data);
    },
    [httpRequestDataSource, setHttpRequestDataSource],
  );

  const handleAddEmptyRow = () => {
    const emptyRow = { id: headersDataSource.length, key: "", value: "" };
    setHeadersDataSource((oldData) => [...oldData, emptyRow]);
  };

  return (
    <div>
      <div className={classes.subHeader}>HTTP Request Configuration</div>
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="id"
        style={httpRequestFormStyle}
        onEditComplete={onHttpRequestEditComplete}
        editable={true}
        columns={columns as any}
        dataSource={httpRequestDataSource}
        showCellBorders={true}
        theme="conductor-light"
        rowStyle={getRowStyle}
        showHeader={false}
      />

      <div style={{ height: 30 }}>
        <IconButton
          size="small"
          style={{ float: "right" }}
          onClick={handleAddEmptyRow}
        >
          <Add fontSize="inherit" />
        </IconButton>

        <div className={classes.subHeader}>Headers</div>
      </div>
      <HeadersDataGrid
        onHeadersEditComplete={onHeadersEditComplete}
        headersDataSource={headersDataSource}
      />

      <JsonInput
        style={{ marginTop: 15 }}
        height="200px"
        label="Request Body (POST & PUT)"
        value={httpRequestBody}
        onChange={setHttpRequestBody}
        language={contentType === "application/json" ? "json" : "plaintext"}
      />
    </div>
  );
}

function HeadersDataGrid({ onHeadersEditComplete, headersDataSource }) {
  const [gridRef, setGridRef] = useState<any>(null);
  const cellDOMProps = (cellProps) => {
    return {
      onClick: () => {
        gridRef.current.startEdit({
          columnId: cellProps.id,
          rowIndex: cellProps.rowIndex,
        });
      },
    };
  };
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
      cellDOMProps,
    },
    {
      name: "value",
      header: "Value",
      defaultFlex: 2,
      cellDOMProps,
    },
  ];

  return (
    <ReactDataGrid
      onReady={setGridRef}
      idProperty="id"
      onEditComplete={onHeadersEditComplete}
      editable={true}
      columns={headersColumns as any}
      dataSource={headersDataSource}
      showCellBorders={true}
      theme="conductor-light"
      rowStyle={getRowStyle}
    />
  );
}

// Note: This mutates obj.
function mergeDataSourceIntoObject(data, obj) {
  data.forEach((item) => {
    if (item.type === "boolean") {
      if (item.value === "false" || item.value === false) {
        obj[item.key] = false;
      } else if (item.value === "true" || item.value === true) {
        obj[item.key] = true;
      } else {
        throw new TypeError("must be boolean");
      }
    } else if (item.type === "int" && item.value !== null) {
      obj[item.key] = parseInt(item.value.toString());
    } else {
      obj[item.key] = item.value;
    }
  });
}
