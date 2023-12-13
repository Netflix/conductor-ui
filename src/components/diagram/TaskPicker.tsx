import { ReactElement } from "react";
import {
  MenuItem,
  ListItemText,
  Autocomplete,
  TextField,
  ListItemIcon,
  AutocompleteProps,
} from "@mui/material";
import { TaskConfigType } from "../../types/workflowDef";
import {
  DoWhileIcon,
  DynamicForkIcon,
  DynamicIcon,
  EventIcon,
  ForkIcon,
  HttpIcon,
  HumanIcon,
  InlineIcon,
  JqTransformIcon,
  SetVariableIcon,
  SimpleIcon,
  StartWorkflowIcon,
  SubWorkflowIcon,
  SwitchIcon,
  TerminateIcon,
  WaitIcon,
} from "./icons/taskIcons";

type TaskOption = {
  value: TaskConfigType;
  label: string;
  description: string;
  icon: ReactElement;
};

const taskOptions: TaskOption[] = [
  {
    value: "SIMPLE",
    label: "Simple",
    description: "Task backed by a user-deployed worker.",
    icon: <SimpleIcon />,
  },
  {
    value: "HTTP",
    label: "HTTP",
    description: "Query an endpoint URL (e.g. REST or GraphQL).",
    icon: <HttpIcon />,
  },
  {
    value: "INLINE",
    label: "Inline",
    description: "User defined script task written using Javascript.",
    icon: <InlineIcon />,
  },
  {
    value: "JSON_JQ_TRANSFORM",
    label: "JQ Transform",
    description: "Transform data using the JQ Language.",
    icon: <JqTransformIcon />,
  },
  {
    value: "SWITCH",
    label: "Switch",
    description:
      "Select a flow branch based on evaluating task input against predefined case values.",
    icon: <SwitchIcon />,
  },
  {
    value: "FORK_JOIN",
    label: "Fork",
    description: "Run a set of statically defined tasks simultaneously.",
    icon: <ForkIcon />,
  },
  {
    value: "DYNAMIC",
    label: "Dynamic",
    description: "De-reference and run one task based on run-time input.",
    icon: <DynamicIcon />,
  },
  {
    value: "FORK_JOIN_DYNAMIC",
    label: "Dynamic Fork",
    description: "Run a set of tasks dynamically based on run-time input.",
    icon: <DynamicForkIcon />,
  },
  {
    value: "SET_VARIABLE",
    label: "Set Variable",
    description:
      "Set a global workflow-scoped variable that can be read by all subsequent tasks.",
    icon: <SetVariableIcon />,
  },
  {
    value: "START_WORKFLOW",
    label: "Start Workflow",
    description:
      "Schedule another workflow for execution without waiting for its completion.",
    icon: <StartWorkflowIcon />,
  },
  {
    value: "SUB_WORKFLOW",
    label: "Sub Workflow",
    description:
      "Schedule another workflow for exeuction and wait for its return value.",
    icon: <SubWorkflowIcon />,
  },
  {
    value: "DO_WHILE",
    label: "Do-While",
    description: "Loop over one or more tasks.",
    icon: <DoWhileIcon />,
  },

  {
    value: "TERMINATE",
    label: "Terminate",
    description: "Terminate the current workflow.",
    icon: <TerminateIcon />,
  },
  {
    value: "EVENT",
    label: "Event",
    description: "Publish an event into one of the supported eventing systems.",
    icon: <EventIcon />,
  },
  {
    value: "HUMAN",
    label: "Human",
    description: "Pause workflow execution until task is completed manually.",
    icon: <HumanIcon />,
  },
  {
    value: "WAIT",
    label: "Wait",
    description: "Pause workflow for a specified time interval.",
    icon: <WaitIcon />,
  },
];

export type TaskPickerProps = {
  onSelect: (type: TaskConfigType) => void;
} & Omit<
  AutocompleteProps<TaskOption, false, false, false>,
  "options" | "renderOption" | "renderInput"
>;

export default function TaskPicker({ onSelect, ...props }: TaskPickerProps) {
  return (
    <Autocomplete<TaskOption>
      onChange={(e, v) => {
        if (v) onSelect!(v!.value);
      }}
      componentsProps={{
        paper: {
          elevation: 1,
        },
      }}
      options={taskOptions}
      renderOption={(props, option: TaskOption) => {
        return (
          <MenuItem {...props}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText
              primary={option.label}
              secondary={option.description}
            />
          </MenuItem>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select a task type" autoFocus />
      )}
      {...props}
    />
  );
}
