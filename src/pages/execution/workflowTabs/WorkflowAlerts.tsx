import React, { useEffect, useMemo } from "react";
import Stack from "@mui/material/Stack";
import { rules, Severity, AlertItem } from ".//ExpertSystemRules";
import { ExecutionAndTasks } from "../../../types/execution";

export default function WorkflowAlerts({
  executionAndTasks,
  setSeverity,
}: {
  executionAndTasks: ExecutionAndTasks;
  setSeverity: Function;
}) {
  const alerts = useMemo(() => {
    const allAlerts: AlertItem[] = [];
    try {
      rules.forEach((rule) => {
        const ruleAlerts = rule(executionAndTasks);
        allAlerts.push(...ruleAlerts);
      });
    } catch (e) {
      console.log("error evaluating rules", e);
    }
    return allAlerts;
  }, [executionAndTasks]);

  useEffect(() => {
    const maxSeverity = findMaxSeverity(alerts);
    setSeverity(maxSeverity);
  }, [alerts, setSeverity]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ margin: "15px" }} spacing={2}>
      {alerts.map((alert, index) => (
        <React.Fragment key={index}>{alert.component}</React.Fragment>
      ))}
    </Stack>
  );
}

const severityToLevel = (severity: Severity | undefined): number => {
  switch (severity) {
    case "ERROR":
      return 3;
    case "WARNING":
      return 2;
    case "INFO":
      return 1;
    default:
      return 0;
  }
};

const levelToSeverity = (level: number): Severity | undefined => {
  switch (level) {
    case 3:
      return "ERROR";
    case 2:
      return "WARNING";
    case 1:
      return "INFO";
    default:
      return undefined;
  }
};

const findMaxSeverity = (alerts: AlertItem[]) => {
  let maxSeverity = 0;

  for (const alert of alerts) {
    const alertSeverity = severityToLevel(alert.severity);

    if (alertSeverity > maxSeverity) {
      maxSeverity = alertSeverity;
    }
  }

  return levelToSeverity(maxSeverity);
};
