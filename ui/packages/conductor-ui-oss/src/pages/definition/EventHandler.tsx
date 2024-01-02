import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import sharedStyles from "../styles";
import { makeStyles } from "@mui/styles";
import { Helmet } from "react-helmet";
import { ReactJson, LinearProgress, Heading, Paper } from "../../components";
import { useEventHandlers } from "../../data/misc";

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    height: "100%",
    alignItems: "stretch",
    flexDirection: "column",
  },
  header: sharedStyles.header,
  paper: {
    flex: 1,
    margin: 30,
    paddingTop: 10,
  },
});

export default function EventHandlerDefinition() {
  const classes = useStyles();
  const params = useParams();

  // TODO: Need API that returns individual event handler by name.
  const { data, isFetching } = useEventHandlers();

  const eventHandler = useMemo(
    () => data && data.find((row) => row.name === params.name),
    [data, params.name],
  );

  return (
    <div className={classes.wrapper}>
      <Helmet>
        <title>Conductor UI - Event Handler Definition - ${params.name}</title>
      </Helmet>
      <div className={classes.header} style={{ paddingBottom: 20 }}>
        <Heading level={1}>Event Handler Definition</Heading>
        <Heading level={4}>{params.name}</Heading>
      </div>
      {isFetching && <LinearProgress />}
      <Paper className={classes.paper}>
        {eventHandler && <ReactJson src={eventHandler} />}
      </Paper>
    </div>
  );
}
