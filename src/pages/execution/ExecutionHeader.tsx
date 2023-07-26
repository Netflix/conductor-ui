import Alert from "@mui/material/Alert";
import {
  NavLink,
  Heading,
  StatusBadge,
  Text,
  Button,
  ClipboardButton,
} from "../../components";

import { makeStyles } from "@mui/styles";
import type { Execution } from "../../types/execution";
import EngineBadge from "../../components/EngineBadge";
import ActionModule from "./ActionModule";
import { useInvalidateExecution } from "../../data/execution";
import { useContext } from "react";
import AppContext from "../../components/context/AppContext";

const useStyles = makeStyles({
  header: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fafafa",
  },
  headerRow: {
    padding: "20px 20px 15px 20px",
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    zIndex: 100,
  },
  headerSubtitle: {
    marginBottom: 20,
  },
  fr: {
    fontSize: "13px",
  },
  fl: {
    flex: 1,
  },
});

export default function ExecutionHeader({
  execution,
}: {
  execution: Execution;
}) {
  const classes = useStyles();
  const { CustomWorkflowActions } = useContext(AppContext);
  const invalidate = useInvalidateExecution(execution.workflowId);
  return (
    <div className={classes.header}>
      <div className={classes.headerRow}>
        <div className={classes.fl}>
          <Heading level={1} gutterBottom>
            {execution.workflowName} <StatusBadge status={execution.status} />{" "}
            <EngineBadge engine={execution.workflowEngine} />
          </Heading>
          <div>
            <Text level={0} className={classes.headerSubtitle}>
              {execution.workflowId}
            </Text>
            <ClipboardButton textToCopy={execution.workflowId} />
          </div>
        </div>

        {execution.parentWorkflowId && (
          <NavLink
            newTab
            path={`/execution/${execution.parentWorkflowId}`}
            className={classes.fr}
          >
            Parent Workflow
          </NavLink>
        )}

        <NavLink
          newTab
          path={`/workflowDef/${execution.workflowName}`}
          className={classes.fr}
        >
          Definition
        </NavLink>

        <Button variant="secondary" onClick={invalidate} className={classes.fr}>
          Refresh
        </Button>

        <ActionModule execution={execution} triggerReload={invalidate} />
        {CustomWorkflowActions && (
          <CustomWorkflowActions execution={execution} />
        )}
      </div>
      {execution.reasonForIncompletion && (
        <Alert
          severity={execution.status === "FAILED" ? "error" : "info"}
          style={{ margin: "0 20px 20px 20px" }}
        >
          {execution.reasonForIncompletion}
        </Alert>
      )}
    </div>
  );
}
