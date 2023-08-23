import { useCallback, useEffect, useState } from "react";
import { Button, FormikJsonInput } from "../../../../components";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import { TypeEditInfo } from "@inovua/reactdatagrid-community/types";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import TextEditor from "@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/editors/Text";
import { Form, Formik } from "formik";
import { terminateTaskParameters } from "../../../../schema/task/terminateTask";
const gridStyle = {
  minHeight: 402.5,
  margin: "15px 0",
};

const TerminateTaskConfigurator = ({ initialConfig, onUpdate }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedJsonState, setUpdatedJsonState] = useState(initialConfig);
//   const {
//     expression = "",
//     evaluatorType,
//     ...rest
//   } = initialConfig.inputParameters || {};

  const [formState, setFormState] = useState({
    workflowOutput: initialConfig.inputParameters.workflowOutput || ""
  });

  useEffect(() => {
    setFormState({
        workflowOutput: initialConfig.inputParameters.workflowOutput || ""
    });
  }, [initialConfig]);

  console.log(formState);

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
      render: ({ value, data }) => {
        // Check if the key matches the conditions
        const displayValue =
          data.key === "terminationStatus" || data.key === "terminationReason" ? `inputParameters.${value}` : value;

        return (
          <span>
            {data.changed ? (
              <span>
                <span style={{ fontWeight: "bold" }}>{displayValue}</span>
              </span>
            ) : (
              displayValue
            )}
            {data.required ? <span style={{ color: "red" }}>*</span> : null}
          </span>
        );
      },
    },
    {
      name: "value",
      header: "Value",
      defaultFlex: 2,
      render: renderCell,
      renderEditor: (Props) => {
        const { data } = Props.cellProps;

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
    let updatedParameters = [...terminateTaskParameters]; // Clone the array

    for (const param of updatedParameters) {
      if (initialConfig.hasOwnProperty(param.key)) {
        const newValue = initialConfig[param.key];
        if (param.value !== newValue) {
          param.value = newValue;
          param.changed = true;
        }
      }
      if (initialConfig.inputParameters.hasOwnProperty(param.key)) {
        const newValue = initialConfig.inputParameters[param.key];
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

  const [dataSource, setDataSource] = useState(terminateTaskParameters);

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
          if (item.value === "false" || item.value === false)
            edittedJson[item.key] = false;
          else if (item.value === "true" || item.value === true)
            edittedJson[item.key] = true;
          else throw new TypeError("must be boolean");
        } else if (item.type === "int") {
          edittedJson[item.key] = parseInt(item.value.toString());
        } else edittedJson[item.key] = item.value;
      });
      const originalObject = JSON.parse(JSON.stringify(updatedJsonState));

      // Step 2: Merge the properties from edittedJson into the original object
      for (const key in edittedJson) {
        if (key === "terminationStatus" || key === "terminationReason") {
          console.log(originalObject.inputParameters[key]);
          console.log(edittedJson[key]);
          originalObject.inputParameters[key] = edittedJson[key];
        } else originalObject[key] = edittedJson[key];
      }

      setUpdatedJsonState(originalObject);
    },
    // eslint-disable-next-line
    [dataSource],
  );

  const handleSubmit = (values) => {
    setFormState(values);
    let newJsonState;
    let newInputParameters;
    newInputParameters = {
      ...JSON.parse(values.additionalInputParameters),
      evaluatorType: updatedJsonState.inputParameters.evaluatorType,
      expression: values.expression,
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
        enableColumnAutosize={true}
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
                key="expression"
                label="inputParameters.expression"
                name="expression"
                className={undefined}
                height={undefined}
                language="javascript"
              />
              <div style={{ marginTop: "15px" }}>
                <FormikJsonInput
                  key="additionalInputParameters"
                  label="Additional inputParameters"
                  name="additionalInputParameters"
                  className={undefined}
                  height={undefined}
                />
              </div>
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

export default TerminateTaskConfigurator;
