import { rowsAtom } from "../pages/execution/workflowTabs/gantt-chart/atoms";
import {
  GenericTaskConfig,
  TaskConfig,
  TaskConfigType,
} from "../types/workflowDef";
import { baseTaskSchema } from "./task/baseTask";

export type SchemaType = "number" | "string" | "boolean" | "object";

export type InterimSchemaField = {
  key: string;
  defaultValue: any;
  placeholderValue?: any;
  required: boolean;
  type: SchemaType;
  alwaysInclude?: boolean;
  visible?: boolean;
};

export function generateBoilerplate(schema: InterimSchemaField[]) {
  const retval = {};

  for (const field of schema) {
    if (field.required || field.alwaysInclude) {
      retval[field.key] = field.placeholderValue || field.defaultValue;
    }
  }
  return retval;
}

export function generateBoilerplateTask<T extends TaskConfig>(
  schema: InterimSchemaField[],
  taskReferenceName: string,
  additionalFields?: any,
) {
  const retval = {
    ...generateBoilerplate(schema),
    inputParameters: {},
    ...additionalFields,
  } as T;
  retval.taskReferenceName = taskReferenceName;
  retval.name = taskReferenceName;
  return retval;
}

export function normalizeObject(schema: InterimSchemaField[], object: any) {
  const retval = {};

  if (!object) return {};

  for (const field of schema) {
    if (field.required || field.alwaysInclude) {
      retval[field.key] = object[field.key] || field.defaultValue;
    } else if (object[field.key] && object[field.key] !== field.defaultValue) {
      retval[field.key] = object[field.key];
    }
  }
  return retval;
}

export function defaultInputExpression() {
  return {
    type: "JSON_PATH",
    expression: "",
  };
}

export function extendSchema(
  taskType: TaskConfigType,
  visibleFields: string[],
  additionalFields: InterimSchemaField[] = [],
) {
  return [
    {
      key: "type",
      defaultValue: taskType,
      required: true,
      alwaysInclude: true,
      type: "string" as SchemaType,
      visible: false,
    },
    ...baseTaskSchema.map((row) =>
      visibleFields.includes(row.key)
        ? {
            ...row,
            visible: true,
          }
        : row,
    ),
    ...additionalFields.map((row) => ({ ...row, visible: true })),
  ];
}

export function parseWithDefault(input: string, defaultValue: any = {}) {
  const trimmed = input.trim();
  if (trimmed === "") {
    return defaultValue;
  } else {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return defaultValue;
    }
  }
}

export function loadInputParameters(config: GenericTaskConfig): string {
  return config.inputParameters
    ? JSON.stringify(config.inputParameters, null, 2)
    : "{}";
}
