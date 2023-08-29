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

export function dataSourceToObject(data) {
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
