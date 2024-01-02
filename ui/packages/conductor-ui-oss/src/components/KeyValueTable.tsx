import { makeStyles } from "@mui/styles";
import { List, ListItem, ListItemText, Skeleton, Tooltip } from "@mui/material";
import _ from "lodash";
import {
  timestampRenderer,
  timestampMsRenderer,
  durationRenderer,
} from "../utils/helpers";
import useAppContext from "../hooks/useAppContext";

const useStyles = makeStyles((theme) => ({
  value: {
    flex: 0.7,
  },
  label: {
    flex: 0.3,
    minWidth: "100px",
  },
  labelText: {
    fontWeight: "bold !important",
  },
  skeleton: {
    marginRight: 20,
  },
}));

const SKELETON_ROWS = 10;

export type KeyValueTableEntry = {
  label: string;
  value: any;
  type?: string;
};

export type KeyValueTableProps = {
  data: KeyValueTableEntry[];
  loading?: boolean;
};

export default function KeyValueTable({ data, loading }: KeyValueTableProps) {
  const classes = useStyles();
  const { customTypeRenderers } = useAppContext();

  if (loading) {
    return (
      <List>
        {_.range(SKELETON_ROWS).map((index) => (
          <ListItem key={index} divider alignItems="flex-start">
            <ListItemText
              className={classes.label}
              primary={
                <Skeleton
                  variant="text"
                  className={classes.skeleton}
                  width={150}
                />
              }
            />
            <ListItemText
              className={classes.value}
              primary={
                <Skeleton
                  variant="text"
                  className={classes.skeleton}
                  width={300}
                />
              }
            />
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <List>
      {data.map((item, index) => {
        let tooltipText = "";
        let displayValue;
        const renderer = item.type ? customTypeRenderers[item.type] : null;
        if (renderer) {
          displayValue = renderer(item.value, data);
        } else {
          switch (item.type) {
            case "date":
              displayValue =
                !isNaN(item.value) && item.value > 0
                  ? timestampRenderer(item.value)
                  : "N/A";
              tooltipText = new Date(item.value).toISOString();
              break;
            case "date-ms":
              displayValue =
                !isNaN(item.value) && item.value > 0
                  ? timestampMsRenderer(item.value)
                  : "N/A";
              tooltipText = new Date(item.value).toISOString();
              break;
            case "duration":
              displayValue =
                !isNaN(item.value) && item.value > 0
                  ? durationRenderer(item.value)
                  : "N/A";
              break;
            default:
              displayValue = !_.isNil(item.value) ? item.value : "N/A";
          }
        }

        return (
          <ListItem key={index} divider alignItems="flex-start">
            <ListItemText
              className={classes.label}
              classes={{ primary: classes.labelText }}
              primary={item.label}
            />

            <ListItemText
              className={classes.value}
              primary={
                <Tooltip
                  placement="right"
                  title={tooltipText}
                  open={tooltipText ? undefined : false}
                >
                  <span>{displayValue}</span>
                </Tooltip>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}
