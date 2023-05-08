import withStyles from "@mui/styles/withStyles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import * as React from "react";

const DefinitionList = ({ children, classes }) => (
  <Table>
    <TableBody className={classes.root}>{children}</TableBody>
  </Table>
);

export default withStyles((theme) => ({
  root: {
    "& tr:first-child": {
      borderTopColor: theme.palette.divider,
      borderTopStyle: "solid",
      borderTopWidth: "1px",
    },
  },
}))(DefinitionList);
