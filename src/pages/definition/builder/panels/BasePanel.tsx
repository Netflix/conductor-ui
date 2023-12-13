import Button from "../../../../components/Button";
import { makeStyles } from "@mui/styles";
import { SvgIconComponent } from "@mui/icons-material";
import { PropsWithChildren } from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";

export type PanelContainerProps = {
  tabId: string;
  handleApply: () => void;
  heading?: string;
  Icon?: SvgIconComponent;
  iconSize?: any;
  parameterOrExpression?: string;
  onParameterOrExpressionChange?: any;
};

export const useStyles = makeStyles({
  container: {
    height: "100%",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  innerContainer: {
    flex: 1,
    overflowY: "scroll",
    padding: 15,
  },
  toolbar: {
    gap: 5,
    paddingRight: 15,
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 5,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgb(250, 250, 253)",
    boxShadow: "0 1px 2px 0px rgba(0, 0, 0, 0.16)",
    zIndex: 1,
  },
  heading: {
    color: "rgb(0, 0, 0, 0.87)",
    fontSize: 14,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  radioLabel: {
    fontSize: "13px !important",
  },
});

export default function PanelContainer({
  Icon,
  iconSize,
  heading,
  handleApply,
  children,
  parameterOrExpression,
  onParameterOrExpressionChange,
}: PropsWithChildren<PanelContainerProps>) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <div className={classes.heading}>
          {Icon && <Icon fontSize={iconSize} />}
          <div>{heading}</div>
        </div>
        <div style={{ flex: 1 }}></div>
        {onParameterOrExpressionChange && (
          <RadioGroup
            row
            name="paramExpGroup"
            value={parameterOrExpression}
            onChange={onParameterOrExpressionChange}
          >
            <FormControlLabel
              value="parameter"
              control={<Radio size="small" />}
              label="Use inputParameters (default)"
              classes={{ label: classes.radioLabel }}
            />
            <FormControlLabel
              value="expression"
              control={<Radio size="small" />}
              label="Use inputExpression"
              classes={{ label: classes.radioLabel }}
            />
          </RadioGroup>
        )}
        <Button onClick={handleApply} size="small">
          Apply
        </Button>
      </div>
      <div className={classes.innerContainer}>{children}</div>
    </div>
  );
}
