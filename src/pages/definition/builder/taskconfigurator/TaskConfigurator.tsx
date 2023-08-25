import { Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button, FormikJsonInput } from "../../../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import { simpleTaskParameters } from "../../../../schema/task/simpleTask";
import { cloneDeep } from "lodash";
import { TaskConfiguratorProps } from "../TaskConfigPanel";

const gridStyle = {
  minHeight: 322.5,
  margin: "15px 0",
};

const TaskConfigurator = ({ initialConfig, onUpdate }: TaskConfiguratorProps) => {
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

  const [dataSource, setDataSource] = useState(simpleTaskParameters);

  useEffect(() => {
    let updatedParameters = cloneDeep(simpleTaskParameters);

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
  }, [initialConfig]);

  const onEditComplete = useCallback(
    (editInfo: TypeEditInfo) => {
      const { value, columnId, rowId } = editInfo;
      //if (!value) return;
      const data = cloneDeep(dataSource);
      if (data[rowId][columnId].toString() === value.toString()) return;
      data[rowId][columnId] = value;
      data[rowId].changed = true;

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
      const originalObject = cloneDeep(updatedJsonState);

      // Step 2: Merge the properties from edittedJson into the original object
      for (const key in edittedJson) {
        originalObject[key] = edittedJson[key];
      }

      setUpdatedJsonState(originalObject);
      console.log("edited", initialConfig);
      setDataSource(data);
    },
    [dataSource, initialConfig, updatedJsonState],
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
      inputExpression: "",
    };

    setFormState(newFormValues); // Clear the form values
  };

  useEffect(() => {
    if (!initialConfig.inputExpression || !initialConfig.inputParameters)
      return;
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
      inputParameters: initialConfig.inputParameters
        ? JSON.stringify(initialConfig.inputParameters)
        : "{}",
      inputExpression:
        initialConfig.inputExpression &&
        initialConfig.inputExpression.expression
          ? initialConfig.inputExpression.expression
          : "",
    });
  }, [initialConfig]);

  const handleSubmit = (values) => {
    setFormState(values);
    let newJsonState;
    if (parameterOrExpression === "expression") {
      newJsonState = {
        ...updatedJsonState,
        inputExpression: {
          expression: values.inputExpression,
          type: "JSON_PATH",
        },
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
                  label="inputParameters"
                  name="inputParameters"
                  className={undefined}
                  height={undefined}
                />
              ) : (
                <FormikJsonInput
                  key="expression"
                  label="inputExpression.expression"
                  name="inputExpression"
                  className={undefined}
                  height={undefined}
                  language="plaintext"
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
