import React, { useContext, useEffect, useMemo } from "react";
import Stack from "@mui/material/Stack";
import { rules, Severity, AlertItem } from ".//ExpertSystemRules";
import { ExecutionAndTasks } from "../../../types/execution";

export default function WorkflowAlerts({executionAndTasks, setSeverity} : {executionAndTasks: ExecutionAndTasks, setSeverity : Function}) {
    const alerts = useMemo(() => {
      const allAlerts: AlertItem[] = [];
  
      rules.forEach((rule) => {
        const ruleAlerts = rule(executionAndTasks);
        allAlerts.push(...ruleAlerts);
      });
  
      return allAlerts;
    }, [executionAndTasks]);
  
    useEffect(() => {
      const maxSeverity = findMaxSeverity(alerts, undefined);
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

  const findMaxSeverity = (
    alerts: AlertItem[],
    currentMaxSeverity: Severity,
  ): Severity => {
    const compareSeverity = (severity: Severity): number => {
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
  
    let maxSeverity = compareSeverity(currentMaxSeverity);
  
    for (const alert of alerts) {
      const alertSeverity = compareSeverity(alert.severity);
  
      if (alertSeverity > maxSeverity) {
        maxSeverity = alertSeverity;
      }
    }
  
    switch (maxSeverity) {
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
  