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
  minHeight: 320,
  margin: "15px 0",
};

const TaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [formState, setFormState] = useState({
    inputParameters: JSON.stringify(initialConfig.inputParameters),
    inputExpression: JSON.stringify(initialConfig.inputExpression),
  });
  const [parameterOrExpression, setParameterOrExpression] =
    useState("parameter");
  const [updatedJsonState, setUpdatedJsonState] = useState(initialConfig);
  const [shouldResetForm, setShouldResetForm] = useState(false);

  const simpleTaskOptionalParameters = [
    {
      id: 0,
      key: "name",
      value: "",
      changed: false,
      required: true,
      type: "string",
    },
    {
      id: 1,
      key: "taskReferenceName",
      value: null,
      changed: false,
      required: true,
    },
    {
      id: 2,
      key: "optional",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 3,
      key: "asyncComplete",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 4,
      key: "startDelay",
      value: 0,
      changed: false,
      required: false,
      type: "int",
    },
    {
      id: 5,
      key: "rateLimited",
      value: false,
      changed: false,
      required: false,
      type: "boolean",
    },
    {
      id: 6,
      key: "retryCount",
      value: 0,
      changed: false,
      required: false,
      type: "int",
    },
  ];

  const renderCell = ({ value }) => {
    return value.toString();
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

        const selectEditorProps = {
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
            return <SelectEditor {...Props} editorProps={selectEditorProps} />;
          default:
            return <TextEditor {...Props} />; // defaulting to NumericEditor or any other editor you prefer
        }
      },
    },
    { name: "changed", header: "Changed", defaultVisible: false },
    { name: "required", header: "Required", defaultVisible: false },
    { name: "type", header: "Type", defaultVisible: false },
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
    }
    setDataSource(updatedParameters);
    setUpdatedJsonState(initialConfig);
    // eslint-disable-next-line
  }, [initialConfig]);

  const [dataSource, setDataSource] = useState(simpleTaskOptionalParameters);

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

      const edittedJson = {};
      data.forEach((item) => {
        if (item.type === "boolean") {
          console.log(item.value);
          if (item.value === "false" || item.value === false)
            edittedJson[item.key] = false;
          else if (item.value === "true" || item.value === true)
            edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int") {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;
      });
      const originalObject = { ...updatedJsonState };

      // Step 2: Merge the properties from edittedJson into the original object
      for (const key in edittedJson) {
        originalObject[key] = edittedJson[key];
      }

      setUpdatedJsonState(originalObject);
      console.log("edited", initialConfig);
    },
    // eslint-disable-next-line
    [dataSource],
  );

  const handleToggleButtonChange = (event, newSelection) => {
    if (newSelection) {
      clearFormValues(); // Clear the form values
      setParameterOrExpression(newSelection);
    }
  };

  const clearFormValues = () => {
    const newFormValues = {
      inputParameters: "{}",
      inputExpression: "{}",
    };

    setFormState(newFormValues); // Clear the form values
  };

  useEffect(() => {
    if (
      JSON.stringify(initialConfig.inputExpression).length >
      JSON.stringify(initialConfig.inputParameters).length
    ) {
      setParameterOrExpression("expression");
    }
  }, [initialConfig]);

  useEffect(() => {
    // Update formState based on initialConfig
    setFormState({
      inputParameters: JSON.stringify(initialConfig.inputParameters),
      inputExpression: JSON.stringify(initialConfig.inputExpression),
    });
  }, [initialConfig]);

  const handleSubmit = (values) => {
    setFormState(values);
    let newJsonState;
    if (parameterOrExpression === "expression") {
      newJsonState = {
        ...updatedJsonState,
        inputExpression: JSON.parse(values.inputExpression),
        inputParameters: {},
      };
    } else {
      newJsonState = {
        ...updatedJsonState,
        inputParameters: JSON.parse(values.inputParameters),
        inputExpression: {},
      };
    }
    setUpdatedJsonState(newJsonState);
    onUpdate(newJsonState);
  };

  const getRowStyle = (data) => {
    console.log(data.changed);
    if (data.data.changed) {
      return { backgroundColor: "#e8f5e9" };
    }
    return {};
  };

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
      <Formik
        initialValues={formState}
        onSubmit={(values) => handleSubmit(values)}
        enableReinitialize={true}
      >
        {(formikProps) => {
          const { resetForm } = formikProps;

          if (shouldResetForm) {
            resetForm({ values: formState });
            setShouldResetForm(false);
          }

          return (
            <Form>
              <ToggleButtonGroup
                value={parameterOrExpression}
                exclusive
                onChange={handleToggleButtonChange}
                aria-label="toggle between parameter and expression"
                style={{ marginBottom: "15px" }}
              >
                <ToggleButton value="parameter" aria-label="use parameter">
                  Use Input Parameters
                </ToggleButton>
                <ToggleButton value="expression" aria-label="use expression">
                  Use Input Expression
                </ToggleButton>
              </ToggleButtonGroup>

              {parameterOrExpression === "parameter" ? (
                <FormikJsonInput
                  key="parameter"
                  label="Input Parameters"
                  name="inputParameters"
                  className={undefined}
                  height={undefined}
                />
              ) : (
                <FormikJsonInput
                  key="expression"
                  label="Input Expression"
                  name="inputExpression"
                  className={undefined}
                  height={undefined}
                />
              )}

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

export default TaskConfigurator;
