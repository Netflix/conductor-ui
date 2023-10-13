import { Route, Routes } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { AppBar, Toolbar } from "@mui/material";
import AppLogo from "./components/AppLogo";

import WorkflowSearch from "./pages/executions/WorkflowSearch";
import TaskSearch from "./pages/executions/TaskSearch";
import AppBarButton from "./components/AppBarButton.tsx";

import Execution from "./pages/execution/Execution";
import WorkflowDefinitions from "./pages/definitions/Workflow";
import WorkflowDefinition from "./pages/definition/WorkflowDefinition";
import TaskDefinitions from "./pages/definitions/Task";
import TaskDefinition from "./pages/definition/TaskDefinition";
import EventHandlerDefinitions from "./pages/definitions/EventHandler";
import EventHandlerDefinition from "./pages/definition/EventHandler";
import TaskQueue from "./pages/misc/TaskQueue";
import KitchenSink from "./pages/kitchensink/KitchenSink";
import DiagramTest from "./pages/kitchensink/DiagramTest";
import Examples from "./pages/kitchensink/Examples";
import Gantt from "./pages/kitchensink/Gantt";
import Workbench from "./pages/workbench/Workbench";

// For rc-dock
import "./components/rc-dock.css";

// For RDG
import "@inovua/reactdatagrid-community/base.css";
import "./components/table.css";
window.moment = require("moment");

const useStyles = makeStyles((theme) => {
  return {
    body: {
      flex: 1,
      overflow: "hidden",
    },
    toolbarRight: {
      marginLeft: "auto",
      display: "flex",
      flexDirection: "row",
    },
  };
});

export default function App({
  appBarModules,
  appBarButtons,
  customAppLogo,
  customRoutes,
}) {
  const classes = useStyles();

  return (
    // Provide context for backward compatibility with class components
    <>
      <AppBar position="relative">
        <Toolbar>
          {customAppLogo || <AppLogo />}

          <AppBarButton path="/">Executions</AppBarButton>
          <AppBarButton path="/workflowDefs">Definitions</AppBarButton>
          <AppBarButton path="/taskQueue">Task Queues</AppBarButton>
          <AppBarButton path="/workbench">Workbench</AppBarButton>

          {appBarButtons}

          <div className={classes.toolbarRight}>{appBarModules}</div>
        </Toolbar>
      </AppBar>
      <div className={classes.body}>
        <Routes>
          <Route path="/" element={<WorkflowSearch />} />
          <Route path="search/tasks" element={<TaskSearch />} />
          <Route path="execution/:id/:taskId?" element={<Execution />} />
          <Route path="/workflowDefs" element={<WorkflowDefinitions />} />
          <Route
            path="/workflowDef/:name?/:version?"
            element={<WorkflowDefinition />}
          />
          <Route path="/taskDefs" element={<TaskDefinitions />} />
          <Route path="/taskDef/:name?" element={<TaskDefinition />} />
          <Route
            path="/eventHandlerDef"
            element={<EventHandlerDefinitions />}
          />
          <Route
            path="/eventHandlerDef/:name"
            element={<EventHandlerDefinition />}
          />
          <Route path="/taskQueue/:name?" element={<TaskQueue />} />
          <Route path="/workbench" element={<Workbench />} />
          <Route path="/kitchen" element={<KitchenSink />} />
          <Route path="/kitchen/diagram" element={<DiagramTest />} />
          <Route path="/kitchen/examples" element={<Examples />} />
          <Route path="/kitchen/gantt" element={<Gantt />} />

          {customRoutes}
        </Routes>
      </div>
    </>
  );
}
