import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useAppContext } from "../export";
import { cleanDuplicateSlash } from "./context/DefaultAppContextProvider";

const useStyles = makeStyles((theme) => ({
  logo: {
    height: 37,
    width: 175,
    marginRight: 30,
  },
}));

export default function AppLogo() {
  const classes = useStyles();
  const { basename } = useAppContext();
  const logoPath = basename + '/logo.svg';
  return <img src={cleanDuplicateSlash(logoPath)} alt="Conductor" className={classes.logo} />;
}
