import { Text, Pill } from "../../components";
import { Toolbar, IconButton, Tooltip } from "@material-ui/core";
import FormikInput from "../../components/formik/FormikInput";
import { makeStyles } from "@material-ui/styles";
import _ from "lodash";
import { Form, setNestedObjectValues, withFormik } from "formik";
import { useWorkflowDef } from "../../data/workflow";
import FormikVersionDropdown from "../../components/formik/FormikVersionDropdown";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import SaveIcon from "@material-ui/icons/Save";
import { colors } from "../../theme/variables";
import { timestampRenderer } from "../../utils/helpers";
import * as Yup from "yup";
import FormikWorkflowNameInput from "../../components/formik/FormikWorkflowNameInput";

const useStyles = makeStyles({
  name: {
    width: "50%",
  },
  submitButton: {
    float: "right",
  },
  toolbar: {
    backgroundColor: colors.gray14,
  },
  workflowName: {
    fontWeight: "bold",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  fields: {
    width: "100%",
    padding: 30,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    overflowY: "auto",
    gap: 15,
  },
});

Yup.addMethod(Yup.string, "isJson", function () {
  return this.test("is-json", "is not valid json", (value) => {
    if (_.isEmpty(value)) return true;

    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  });
});
const validationSchema = Yup.object({
  workflowName: Yup.string().required("Workflow Name is required"),
  workflowInput: Yup.string().isJson(),
  taskToDomain: Yup.string().isJson(),
});

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: ({ selectedRun }) =>
    runPayloadToFormData(_.get(selectedRun, "runPayload")),
  validationSchema: validationSchema,
})(WorkbenchForm);

function WorkbenchForm(props) {
  const {
    values,
    validateForm,
    setTouched,
    setFieldValue,
    dirty,
    selectedRun,
    saveRun,
    executeRun,
  } = props;
  const classes = useStyles();
  const { workflowName, workflowVersion } = values;
  const createTime = selectedRun ? selectedRun.createTime : undefined;

  const { refetch } = useWorkflowDef(workflowName, workflowVersion, null, {
    onSuccess: populateInput,
    enabled: false,
  });

  function triggerPopulateInput() {
    refetch();
  }

  function populateInput(workflowDef) {
    let bootstrap = {};

    if (!_.isEmpty(values.workflowInput)) {
      const existing = JSON.parse(values.workflowInput);
      bootstrap = _.pickBy(existing, (v) => v !== "");
    }

    if (workflowDef.inputParameters) {
      for (let param of workflowDef.inputParameters) {
        if (!_.has(bootstrap, param)) {
          bootstrap[param] = "";
        }
      }

      setFieldValue("workflowInput", JSON.stringify(bootstrap, null, 2));
    }
  }

  function handleRun() {
    validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        const payload = formDataToRunPayload(values);
        if (!dirty && createTime) {
          console.log("Executing pre-existing run. Append workflowRecord");
          executeRun(createTime, payload);
        } else {
          console.log("Executing new run. Save first then execute");
          const newRun = saveRun(payload);
          executeRun(newRun.createTime, payload);
        }
      } else {
        // Handle validation error manually (not using handleSubmit)
        setTouched(setNestedObjectValues(errors, true));
      }
    });
  }

  function handleSave() {
    validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        const payload = formDataToRunPayload(values);
        saveRun(payload);
      } else {
        setTouched(setNestedObjectValues(errors, true));
      }
    });
  }

  // const [field, meta, helpers] = useField(props);
  var workflowInput = 'hello world';

  function showFile  (e) { 
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => { 
      const text = (e.target.result);
      console.log(text);
      workflowInput = text;
      console.log(workflowInput);

      document.getElementById("InputJson").value = (text);

       
      var ugly = document.getElementById('InputJson').value;
      var obj = JSON.parse(ugly);
      var pretty = JSON.stringify(obj, undefined, 2);
      document.getElementById('InputJson').value = pretty;
    }; 
    reader.readAsText(e.target.files[0]);
  }

  const useStylesField = makeStyles({
    wrapper: {
      width: "100%",
    },
    monaco: {
      textAlign: "left",
      paddingLeft: 10,
      float: "left",
      resize: "none",
      width: "100%",
      borderColor: "rgba(128, 128, 128, 0.2)",
      borderStyle: "solid",
      borderWidth: 1,
      borderRadius: 4,
      backgroundColor: "rgb(255, 255, 255)",
      height: 200,
      outline: 0,
      "&:focus-within": {
        margin: -2,
        borderColor: "rgb(73, 105, 228)",
        borderStyle: "solid",
        borderWidth: 2,
      },
    },
    label: {
      display: "block",
      fontFamily: 'Segoe UI',
      fontSize: 13,
      color: '#050505',
      fontWeight: 600,
      wordSpacing: 0,
      margin: 0,
      lineHeight: 0
    },
  });
  const classesField = useStylesField();

  return (
    <Form className={classes.main}>
      <Toolbar className={classes.toolbar}>
        <Text className={classes.workflowName}>Workflow Workbench</Text>
        <Tooltip title="Execute Workflow">
          <IconButton onClick={handleRun}>
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save Workflow Trigger">
          <div>
            <IconButton disabled={!dirty} onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </div>
        </Tooltip>

        <Tooltip title="Populate Input Parameters">
          <div>
            <IconButton
              disabled={!values.workflowName}
              onClick={triggerPopulateInput}
            >
              <PlaylistAddIcon />
            </IconButton>
          </div>
        </Tooltip>

        {dirty && <Pill label="Modified" />}
        {createTime && <Text>Created: {timestampRenderer(createTime)}</Text>}
      </Toolbar>

      <div className={classes.fields}>
        <FormikWorkflowNameInput
          fullWidth
          label="Workflow Name"
          name="workflowName"
        />

        <FormikVersionDropdown
          fullWidth
          label="Workflow version"
          name="workflowVersion"
        />

        <label className={classesField.label}>Input (JSON)</label>
        <input id="InputJson" type="text" className={classesField.monaco} />

        <input type="file" accept=".json" onChange={(e) => showFile(e)} />

        <FormikInput fullWidth label="Correlation ID" name="correlationId" />


        <label className={classesField.label}>Task to Domain (JSON)</label>
        <input id="InputJson" type="text" className={classesField.monaco} />

        <input type="file" accept=".json" onChange={(e) => showFile(e)} />

      </div>
    </Form>
  );
}



function runPayloadToFormData(runPayload) {
  return {
    workflowName: _.get(runPayload, "name", ""),
    workflowVersion: _.get(runPayload, "version", ""),
    workflowInput: _.has(runPayload, "input")
      ? JSON.stringify(runPayload.input, null, 2)
      : "",
    correlationId: _.get(runPayload, "correlationId", ""),
    taskToDomain: _.has(runPayload, "taskToDomain")
      ? JSON.stringify(runPayload.taskToDomain, null, 2)
      : "",
  };
}

function formDataToRunPayload(form) {
  let runPayload = {
    name: form.workflowName,
  };
  if (form.workflowVersion) {
    runPayload.version = form.workflowVersion;
  }
  if (form.workflowInput) {
    runPayload.input = JSON.parse(form.workflowInput);
  }
  if (form.correlationId) {
    runPayload.correlationId = form.correlationId;
  }
  if (form.taskToDomain) {
    runPayload.taskToDomain = JSON.parse(form.taskToDomain);
  }
  return runPayload;
}

//  runHistoryRef.current.pushRun(runPayload);
