import { Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button, FormikInput, FormikJsonInput, Paper } from "../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

const gridStyle = {
  minHeight: 550,
};

const cellStyle = {
  border: "1px solid #ccc", // Add border to each cell
  padding: "8px", // Add some padding to the cells for spacing
  backgroundColor: "red !important",
};

const renderCell = ({ value }) => {
  return value.toString(); // Custom rendering for boolean values
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
            <span style={{ fontWeight: "bold" }}> (Changed)</span>
          </span>
        ) : (
          value
        )}
        {data.required ? <span style={{ color: "red" }}>*</span> : null}
      </span>
    ),
  },
  { name: "value", header: "Value", defaultFlex: 1, render: renderCell },
  { name: "changed", header: "Changed", defaultVisible: false },
  { name: "required", header: "Required", defaultVisible: false },
  { name: "type", header: "Type", defaultVisible: false },
];

const TaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [formState, setFormState] = useState({
    inputParameters: JSON.stringify(initialConfig.inputParameters),
    inputExpression: JSON.stringify(initialConfig.inputExpression),
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
    // {id: 3, key : "inputParameters", value: "", changed: false, required: false},
    // {id: 4, key : "inputExpression", value: "", changed: false, required: false},
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

  useEffect(() => {
    for (const param of simpleTaskOptionalParameters) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
    }
    setDataSource(simpleTaskOptionalParameters);
    setUpdatedJsonState(initialConfig);
  }, [initialConfig]);

  const [dataSource, setDataSource] = useState(simpleTaskOptionalParameters);

  const onEditComplete = useCallback(
    ({ value, columnId, rowId }) => {
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
          edittedJson[item.key] = parseInt(item.value, 10);
        } else edittedJson[item.key] = item.value;
      });
      const originalObject = updatedJsonState;

      // Step 2: Merge the properties from edittedJson into the original object
      for (const key in edittedJson) {
        originalObject[key] = edittedJson[key];
        console.log(key);
      }

      setUpdatedJsonState(originalObject);
    },
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
      inputParameters: "",
      inputExpression: "",
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
        inputExpression: JSON.stringify(initialConfig.inputExpression)
    });
}, [initialConfig]);

const handleSubmit = (values) => {
  setFormState(values);
  let newJsonState;
  if (parameterOrExpression === "expression") {
    newJsonState = {
      ...updatedJsonState,
      ["inputExpression"]: JSON.parse(values.inputExpression),
      ["inputParameters"]: {},
    };
  } else {
    newJsonState = {
      ...updatedJsonState,
      ["inputParameters"]: JSON.parse(values.inputParameters),
      ["inputExpression"]: {},
    };
  }
  setUpdatedJsonState(newJsonState);
  onUpdate(newJsonState);
};

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onEditComplete={onEditComplete}
        editable={true}
        columns={columns}
        dataSource={dataSource}
        cellStyle={cellStyle}
        showCellBorders="horizontal"
        theme="conductor-light"
        key={refreshKey}
      />
      <Formik
        initialValues={formState}
        onSubmit={(values) => handleSubmit(values)}
        enableReinitialize={true}
      >
        {(formikProps) => {
          // Destructure resetForm from the Formik bag
          const { resetForm } = formikProps;

          // Use a useEffect hook to reset the form when formState changes
          useEffect(() => {
            console.log("Current formState:", formState);
            resetForm({ values: formState });
          }, [formState, resetForm]); // Including resetForm in the dependency array for completeness

          // Return the Form component with all its children
          return (
            <Form>
              <ToggleButtonGroup
                value={parameterOrExpression}
                exclusive
                onChange={handleToggleButtonChange}
                aria-label="toggle between parameter and expression"
              >
                <ToggleButton value="parameter" aria-label="use parameter">
                  Use Input Parameters
                </ToggleButton>
                <ToggleButton value="expression" aria-label="use expression">
                  Use Input Expression
                </ToggleButton>
              </ToggleButtonGroup>

              {parameterOrExpression === "parameter" ? (
                <span>Selected: Use Input Parameter</span>
              ) : (
                <span>Selected: Use Input Expression</span>
              )}

              {parameterOrExpression === "parameter" ? (
                <FormikJsonInput
                  key="parameter"
                  label="Input Parameters"
                  name="inputParameters"
                />
              ) : (
                <FormikJsonInput
                  key="expression"
                  label="Input Expression"
                  name="inputExpression"
                />
              )}

              <Button type="submit">Submit</Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default TaskConfigurator;
