import { useCallback, useEffect, useMemo, useState } from "react";
import { IconButton } from "@mui/material";
import {
  httpTaskLevelParameters,
  httpRequestParameters,
} from "../../../../schema/task/httpTask";
import _ from "lodash";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { HttpIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  generateBoilerplate,
  normalizeObject,
} from "../../../../schema/schemaUtils";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import { produce } from "immer";
import { makeStyles } from "@mui/styles";
import Add from "@mui/icons-material/Add";
import JsonInput from "../../../../components/JsonInput";

const useStyles = makeStyles({
  httpRequestPanel: {
    marginTop: 30,
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
  marginTop: {
    marginTop: 30,
  },
});

const HttpTaskConfigurator = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const classes = useStyles();

  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");
  const [inputExpression, setInputExpression] = useState("");
  const [taskLevelParams, setTaskLevelParams] = useState({});
  const [httpRequest, setHttpRequest] = useState<any>({});
  const [headers, setHeaders] = useState({});

  useEffect(() => {
    setParameterOrExpression(
      initialConfig.inputExpression ? "expression" : "parameter",
    );
    setInputExpression(_.get(initialConfig, "inputExpression.expression", ""));
    setTaskLevelParams(normalizeObject(httpTaskLevelParameters, initialConfig));
    setHttpRequest(
      normalizeObject(
        httpRequestParameters,
        _.get(
          initialConfig,
          "inputParameters.http_request",
          generateBoilerplate(httpRequestParameters),
        ),
      ),
    );
    setHeaders(
      _.get(initialConfig, "inputParameters.http_request.headers", {}),
    );
    onChanged(false);
  }, [initialConfig, onChanged]);

  const handleHttpRequestChange = useCallback(
    (obj) => {
      setHttpRequest(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleTaskLevelParametersChange = useCallback(
    (obj) => {
      setTaskLevelParams(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleHeadersChange = useCallback(
    (obj) => {
      setHeaders(obj);
      onChanged(true);
    },
    [onChanged],
  );

  const handleParameterOrExpressionChange = useCallback(
    (e, v) => {
      setParameterOrExpression(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleInputExpressionChange = useCallback(
    (v) => {
      setInputExpression(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleApply = useCallback(() => {
    let retval;
    if (parameterOrExpression === "parameter") {
      retval = {
        ...taskLevelParams,
        inputParameters: {
          http_request: {
            ...httpRequest,
          },
        },
      };

      // Append headers only if necessary
      if (!_.isEmpty(headers)) {
        retval.inputParameters.http_request.headers = headers;
      }

      // Backfill body which is managed in separate tab.
      if (httpRequest.method === "PUT" || httpRequest.method === "POST") {
        retval.inputParameters.http_request.body = _.get(
          initialConfig,
          "inputParameters.http_request.body",
        );
      }
    } else {
      retval = {
        ...taskLevelParams,
        inputExpression: {
          type: "JSON_PATH",
          expression: inputExpression,
        },
      };
    }

    onUpdate(retval);
  }, [
    headers,
    httpRequest,
    initialConfig,
    inputExpression,
    onUpdate,
    parameterOrExpression,
    taskLevelParams,
  ]);

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="Http Task"
      Icon={HttpIcon}
      iconSize="medium"
      parameterOrExpression={parameterOrExpression}
      onParameterOrExpressionChange={handleParameterOrExpressionChange}
    >
      <div style={{ marginBottom: 15 }}>
        The HTTP task is used to call a service that exposes an API endpoint
        (e.g. REST or GraphQL). It will complete once the remote service
        responds with a success status (2xx).
      </div>

      <AttributeTable
        schema={httpTaskLevelParameters}
        config={taskLevelParams}
        onChange={handleTaskLevelParametersChange}
      />

      {parameterOrExpression === "parameter" && (
        <div className={classes.httpRequestPanel}>
          <div>
            <div className={classes.subHeader} style={{ marginBottom: 10 }}>
              HTTP Request
            </div>
            <AttributeTable
              schema={httpRequestParameters}
              config={httpRequest}
              onChange={handleHttpRequestChange}
            />
          </div>

          <HeadersDataGrid headers={headers} onChange={handleHeadersChange} />
        </div>
      )}

      {parameterOrExpression === "expression" && (
        <JsonInput
          className={classes.marginTop}
          key="expression"
          label="inputExpression (JsonPath)"
          language="plaintext"
          value={inputExpression}
          onChange={handleInputExpressionChange}
        />
      )}
    </PanelContainer>
  );
};

function HeadersDataGrid({ headers, onChange }) {
  const [gridRef, setGridRef] = useState<any>(null);
  const classes = useStyles();

  const cellDOMProps = useCallback(
    (cellProps) => {
      return {
        onClick: (e) => {
          if (e.target.tagName === "DIV") {
            gridRef.current.startEdit({
              columnId: cellProps.id,
              rowIndex: cellProps.rowIndex,
            });
          }
        },
      };
    },
    [gridRef],
  );

  const headersColumns = useMemo(
    () => [
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
        defaultFlex: 1,
        cellDOMProps,
      },
    ],
    [cellDOMProps],
  );

  const dataSource = useMemo(
    () =>
      Object.entries(headers).map(([key, value]) => ({
        key,
        value,
      })),
    [headers],
  );

  const handleAddEmptyRow = useCallback(() => {
    let newKey = "new-header";
    let count = 0;
    while (headers.hasOwnProperty(newKey)) {
      newKey = "new-header" + count++;
    }
    onChange({ ...headers, [newKey]: "" });
  }, [headers, onChange]);

  const handleEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowIndex } = editInfo;

      const newDataSource = produce(dataSource, (draft) => {
        draft[rowIndex][columnId] = value;
      });

      const retval = {};
      for (const row of newDataSource) {
        if (!_.isEmpty(row.key)) {
          retval[row.key] = row.value;
        }
      }

      onChange(retval);
    },
    [dataSource, onChange],
  );

  return (
    <div>
      <div style={{ height: 30 }}>
        <IconButton
          size="small"
          style={{ float: "right" }}
          onClick={handleAddEmptyRow}
        >
          <Add fontSize="inherit" />
        </IconButton>

        <div className={classes.subHeader}>
          Additional Headers (excl. Content-Type and Accept)
        </div>
      </div>

      <ReactDataGrid
        onReady={setGridRef}
        idProperty="key"
        style={{ minHeight: 200 }}
        onEditComplete={handleEditComplete}
        editable={true}
        columns={headersColumns}
        dataSource={dataSource}
        showCellBorders={true}
        theme="conductor-light"
      />
    </div>
  );
}

export default HttpTaskConfigurator;
