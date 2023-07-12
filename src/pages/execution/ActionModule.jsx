import { useMemo } from "react";
import { makeStyles } from "@mui/styles";
import { isFailedTask } from "../../utils/helpers";
import { DropdownButton } from "../../components";
import { ListItemIcon, ListItemText } from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import ResumeIcon from "@mui/icons-material/PlayArrow";
import RedoIcon from "@mui/icons-material/Redo";
import FlareIcon from "@mui/icons-material/Flare";

import {
  useRestartAction,
  useRestartLatestAction,
  useResumeAction,
  useRetryResumeSubworkflowTasksAction,
  useRetryAction,
  useTerminateAction,
  usePauseAction,
} from "../../data/actions";

const useStyles = makeStyles({
  terminate: {
    color: "red",
  },
});

export default function ActionModule({ execution, triggerReload }) {
  const classes = useStyles();
  const { workflowId, workflowDefinition } = execution;

  const restartAction = useRestartAction({ workflowId, onSuccess });
  const restartLatestAction = useRestartLatestAction({ workflowId, onSuccess });
  const retryAction = useRetryAction({ workflowId, onSuccess });
  const retryResumeSubworkflowTasksAction =
    useRetryResumeSubworkflowTasksAction({ workflowId, onSuccess });
  const terminateAction = useTerminateAction({ workflowId, onSuccess });
  const resumeAction = useResumeAction({ workflowId, onSuccess });
  const pauseAction = usePauseAction({ workflowId, onSuccess });

  const { restartable } = workflowDefinition;

  function onSuccess() {
    triggerReload();
  }

  const options = [];

  const hasRetryableSubworkflow = useMemo(
    () =>
      ["FAILED", "TIMED_OUT", "TERMINATED"].includes(execution.status) &&
      execution.tasks.find(
        (task) => task.taskType === "SUB_WORKFLOW" && isFailedTask(task.status),
      ),
    [execution],
  );

  // RESTART buttons
  if (
    ["COMPLETED", "FAILED", "TIMED_OUT", "TERMINATED"].includes(
      execution.status,
    ) &&
    restartable
  ) {
    options.push({
      label: (
        <>
          <ListItemIcon>
            <ReplayIcon />
          </ListItemIcon>
          <ListItemText>Restart with Current Definitions</ListItemText>
        </>
      ),
      handler: () => restartAction.mutate(),
    });

    options.push({
      label: (
        <>
          <ListItemIcon>
            <FlareIcon />
          </ListItemIcon>
          <ListItemText>Restart with Latest Definitions</ListItemText>
        </>
      ),
      handler: () => restartLatestAction.mutate(),
    });
  }

  // PAUSE button
  if (execution.status === "RUNNING") {
    options.push({
      label: (
        <>
          <ListItemIcon>
            <PauseIcon />
          </ListItemIcon>
          <ListItemText>Pause</ListItemText>
        </>
      ),
      handler: () => pauseAction.mutate(),
    });
  }

  // RESUME button
  if (execution.status === "PAUSED") {
    options.push({
      label: (
        <>
          <ListItemIcon>
            <ResumeIcon />
          </ListItemIcon>
          <ListItemText>Resume</ListItemText>
        </>
      ),
      handler: () => resumeAction.mutate(),
    });
  }

  // RETRY (from task) button
  if (["FAILED", "TIMED_OUT", "TERMINATED"].includes(execution.status)) {
    options.push({
      label: (
        <>
          <ListItemIcon>
            <RedoIcon />
          </ListItemIcon>
          <ListItemText>Retry - From failed task</ListItemText>
        </>
      ),
      handler: () => retryAction.mutate(),
    });
  }

  // RETRY (failed subworkflow) button
  if (hasRetryableSubworkflow) {
    options.push({
      label: (
        <>
          <ListItemIcon>
            <RedoIcon />
          </ListItemIcon>
          <ListItemText>Retry - Resume failed subworkflow</ListItemText>
        </>
      ),
      handler: () => retryResumeSubworkflowTasksAction.mutate(),
    });
  }

  // RERUN button

  // TERMINATE button
  if (["RUNNING", "FAILED", "TIMED_OUT", "PAUSED"].includes(execution.status)) {
    options.push({
      label: (
        <>
          <ListItemIcon className={classes.terminate}>
            <StopIcon />
          </ListItemIcon>
          <ListItemText className={classes.terminate}>Terminate</ListItemText>
        </>
      ),
      handler: () => terminateAction.mutate(),
    });

    options.push({
      label: (
        <>
          <ListItemIcon className={classes.terminate}>
            <StopIcon />
          </ListItemIcon>
          <ListItemText className={classes.terminate}>
            Terminate with Reason
          </ListItemText>
        </>
      ),
      handler: () => {
        const reason = window.prompt("Termination Reason", "");
        if (reason) terminateAction.mutate({ reason });
      },
    });
  }

  return <DropdownButton options={options}>Actions</DropdownButton>;
}
