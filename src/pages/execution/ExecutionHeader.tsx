import Alert from "@mui/material/Alert";
import { NavLink, Heading, StatusBadge, Text } from "../../components";

import { makeStyles } from "@mui/styles";
import { ExecutionAndTasks } from "../../types/execution";
import EngineBadge from "../../components/EngineBadge";

const useStyles = makeStyles({
  header: {
    padding: "20px 20px 15px 20px",
    backgroundColor: "#fafafa",
  },
  workflowPanel: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  headerSubtitle: {
    marginBottom: 20,
  },
  fr: {
    display: "flex",
    position: "relative",
    float: "right",
    marginRight: 50,
    marginTop: 10,
    zIndex: 1,
  },
  frItem: {
    display: "flex",
    alignItems: "center",
    marginRight: 15,
  },
});

export default function ExecutionHeader({
  executionAndTasks,
}: {
  executionAndTasks?: ExecutionAndTasks;
}) {
  const classes = useStyles();

  if (!executionAndTasks) {
    return null;
  }

  const { execution } = executionAndTasks;

  return (
    <div className={classes.header}>
      <div className={classes.fr}>
        {execution.parentWorkflowId && (
          <div className={classes.frItem}>
            <NavLink newTab path={`/execution/${execution.parentWorkflowId}`}>
              Parent Workflow
            </NavLink>
          </div>
        )}
        <div className={classes.frItem}>
          <NavLink newTab path={`/workflowDef/${execution.workflowName}`}>
            Definition
          </NavLink>
        </div>
        {/*
        <SecondaryButton onClick={refresh} style={{ marginRight: 10 }}>
          Refresh
        </SecondaryButton>
        <ActionModule execution={execution} triggerReload={refresh} />
        */}
      </div>
      <Heading level={1} gutterBottom>
        {execution.workflowName} <StatusBadge status={execution.status} /> <EngineBadge engine={execution.workflowEngine} />
      </Heading>
      <Text level={0} className={classes.headerSubtitle}>
        {execution.workflowId}
      </Text>

      {execution.reasonForIncompletion && (
        <Alert severity="error">{execution.reasonForIncompletion}</Alert>
      )}
    </div>
  );
}
