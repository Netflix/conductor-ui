import { makeStyles } from "@mui/styles";
import { cloneDeep } from "lodash";

// Note: This mutates obj.
export function mergeDataSourceIntoObject(data, obj) {
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

export function dataSourceToObject(data, taskType) {
  const obj = {};
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

  if (taskType === "TERMINATE") {
    const returnValue = { inputParameters: {} };
    for (const key in obj) {
      if (key === "terminationStatus" || key === "terminationReason") {
        returnValue["inputParameters"][key] = obj[key];
      } else returnValue[key] = obj[key];
    }
    return returnValue;
  }

  if (taskType === "INLINE") {
    const returnValue = { inputParameters: {} };
    for (const key in obj) {
      if (key === "evaluatorType") {
        returnValue["inputParameters"][key] = obj[key];
      } else returnValue[key] = obj[key];
    }
    return returnValue;
  }

  if (taskType === "SUB_WORKFLOW") {
    const returnValue = { subWorkflowParam: {} };
    for (const key in obj) {
      if (key === "subWorkflowParam.name") {
        returnValue["subWorkflowParam"]["name"] = obj[key];
      } else if (key === "subWorkflowParam.version") {
        returnValue["subWorkflowParam"]["version"] = obj[key];
      } else returnValue[key] = obj[key];
    }
    return returnValue;
  }

  return obj;
}

export function validateDatasource(dataSource) {
  const data = cloneDeep(dataSource);
  console.log(data);
  return data.some((item) => {
    if (item.required) {
      return !item.value || !item.value.trim() || item.value.length == 0;
    }
    return false;
  });
}

export const booleanEditorProps = {
  idProperty: "id",
  dataSource: [
    { id: "true", label: "true" },
    { id: "false", label: "false" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

export const useStyles = makeStyles({
  container: {
    margin: 15,
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

export function getRowStyle(data) {
  if (data.data.changed) {
    return { backgroundColor: "#FFF" };
  } else return { backgroundColor: "#F3F3F3" };
}

export const terminationStatusEditorProps = {
  idProperty: "id",
  dataSource: [
    { id: "COMPLETED", label: "COMPLETED" },
    { id: "FAILED", label: "FAILED" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};

export const evaluatorTypeEditorProps = {
  idProperty: "id",
  dataSource: [
    { id: "value-param", label: "value-param" },
    { id: "javascript", label: "javascript" },
  ],
  collapseOnSelect: true,
  clearIcon: null,
};
