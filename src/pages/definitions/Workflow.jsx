import { NavLink, DataTable, Button } from "../../components";
import { makeStyles } from "@mui/styles";
import _ from "lodash";
import { useQueryState } from "react-router-use-location-state";
import { usePaginatedWorkflowDefs } from "../../data/workflow";
import Header from "./Header";
import sharedStyles from "../styles";
import { Helmet } from "react-helmet";
import AddIcon from "@mui/icons-material/Add";
import { CircularProgress } from "@mui/material";

const useStyles = makeStyles({
  ...sharedStyles,
  progress: {
    height: 200,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

const columns = [
  {
    name: "name",
    renderer: (val) => (
      <NavLink path={`/workflowDef/${val.trim()}`}>{val.trim()}</NavLink>
    ),
    grow: 2,
  },
  { name: "description", grow: 2, sortable: false, searchable: false },
  { name: "createTime", type: "date", sortable: false, searchable: false },
  {
    name: "version",
    label: "Latest Version",
    grow: 0.5,
    sortable: false,
    searchable: false,
  },
  { name: "schemaVersion", grow: 0.5, sortable: false, searchable: false },
  { name: "restartable", grow: 0.5, sortable: false, searchable: false },
  {
    name: "workflowStatusListenerEnabled",
    grow: 0.5,
    sortable: false,
    searchable: false,
  },
  { name: "ownerEmail", sortable: false, searchable: false },
  { name: "inputParameters", type: "json", sortable: false, searchable: false },
  {
    name: "outputParameters",
    type: "json",
    sortable: false,
    searchable: false,
  },
  { name: "timeoutPolicy", grow: 0.5, sortable: false, searchable: false },
  { name: "timeoutSeconds", grow: 0.5, sortable: false, searchable: false },
  {
    id: "task_types",
    name: "tasks",
    label: "Task Types",
    searchable: false,
    sortable: false,
    renderer: (val) => {
      const taskTypeSet = new Set();
      for (let task of val) {
        taskTypeSet.add(task.type);
      }
      return Array.from(taskTypeSet).join(", ");
    },
  },
  {
    id: "task_count",
    name: "tasks",
    label: "Tasks",
    searchable: false,
    sortable: false,
    grow: 0.5,
    renderer: (val) => (_.isArray(val) ? val.length : 0),
  },
  {
    id: "executions_link",
    name: "name",
    label: "Executions",
    sortable: false,
    searchable: false,
    grow: 0.5,
    renderer: (name) => (
      <NavLink path={`/?workflowType=${name.trim()}`} newTab>
        Query
      </NavLink>
    ),
  },
];

export default function WorkflowDefinitions() {
  const PAGE_SIZE = 15;
  const classes = useStyles();

  const [nameFilter, setNameFilter] = useQueryState("filter", "");
  const [page, setPage] = useQueryState("page", 1);
  const { isFetching, totalHits, workflows } = usePaginatedWorkflowDefs(
    PAGE_SIZE * (page - 1),
    PAGE_SIZE * page,
    nameFilter,
  );

  const handleFilterChange = (obj) => {
    setPage(1);
    if (obj && obj.columnName === "name") {
      setNameFilter(obj.substring);
    } else {
      setNameFilter("");
    }
  };

  const handlePageChange = (page, totalRows) => {
    setPage(page);
  };

  return (
    <div className={classes.wrapper}>
      <Helmet>
        <title>Conductor UI - Workflow Definitions</title>
      </Helmet>
      <Header tabIndex={0} />

      <div className={classes.tabContent}>
        <div className={classes.buttonRow}>
          <Button
            component={NavLink}
            path="/workflowDef"
            startIcon={<AddIcon />}
          >
            New Workflow Definition
          </Button>
        </div>

        <DataTable
          title={totalHits !== null && `${totalHits} results`}
          localStorageKey="definitionsTable"
          defaultShowColumns={[
            "name",
            "description",
            "version",
            "createTime",
            "ownerEmail",
            "task_count",
            "executions_link",
          ]}
          keyField="name"
          onFilterChange={handleFilterChange}
          o
          initialFilterObj={{
            columnName: "name",
            substring: nameFilter,
          }}
          data={workflows}
          columns={columns}
          paginationServer
          paginationTotalRows={totalHits}
          paginationRowsPerPageOptions={[PAGE_SIZE]}
          onChangePage={handlePageChange}
          paginationDefaultPage={page}
          progressPending={isFetching}
          progressComponent={
            <div className={classes.progress}>
              <CircularProgress />
            </div>
          }
        />
      </div>
    </div>
  );
}
