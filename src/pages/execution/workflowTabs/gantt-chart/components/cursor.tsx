import {
  canvasHeightAtom,
  cursorXAtom,
  cursorYAtom,
  marginLeftAtom,
  xScaleAtom,
} from "../atoms";
import { defaultFormatter } from "../utils";
import { useAtomValue } from "jotai";
import { useGanttContext } from "../internal/gantt-context";
import React from "react";
import dayjs from "dayjs";

export interface CursorProps {
  dateFormat?: string;
  labelFormatter?: (label: string | number) => string | number;
}

export function Cursor({
  labelFormatter = defaultFormatter,
  dateFormat = "hh:mm:ss",
}: CursorProps) {
  const xScale = useAtomValue(xScaleAtom);
  const cursorX = useAtomValue(cursorXAtom);
  const cursorY = useAtomValue(cursorYAtom);
  const marginLeft = useAtomValue(marginLeftAtom);
  const canvasHeight = useAtomValue(canvasHeightAtom);

  const { classes } = useGanttContext();

  const label = labelFormatter(
    dayjs(xScale.invert(cursorX - marginLeft)).format(dateFormat),
  );

  // prevent line from capturing clicks if cursor is above clickable elements
  const xLag = 1;

  return cursorX > -1 ? (
    <g>
      <text
        className={classes.xAxisLabel}
        textAnchor="middle"
        dominantBaseline="hanging"
        transform={`translate(${cursorX - xLag}, ${cursorY + 20})`}
      >
        {label}
      </text>
      <line
        className={classes.cursorLine}
        opacity={0.5}
        x1={cursorX - xLag}
        y1="0"
        x2={cursorX}
        y2={canvasHeight + 25}
      />
      <text
        className={classes.xAxisLabel}
        textAnchor="middle"
        dominantBaseline="hanging"
        transform={`translate(${cursorX - xLag}, ${canvasHeight + 30})`}
      >
        {label}
      </text>
    </g>
  ) : (
    <></>
  );
}
