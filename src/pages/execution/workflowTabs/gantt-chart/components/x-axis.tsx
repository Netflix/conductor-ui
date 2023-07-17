import {
  canvasAtom,
  canvasHeightAtom,
  canvasWidthAtom,
  graphOffset,
  marginLeftAtom,
  xScaleAtom,
} from "../atoms";
import { defaultFormatter } from "../utils";
import { getTextWidth, smartTimeFormat } from "../internal/utils";
import { useAtomValue } from "jotai";
import { useGanttContext } from "../internal/gantt-context";
import React, { useMemo } from "react";
import dayjs from "dayjs";

export interface XAxisProps {
  dateFormat?: string;
  labelFormatter?: (
    label: string | number,
    axisTicks?: boolean,
  ) => string | number;
}
export function XAxis({
  labelFormatter = defaultFormatter,
  dateFormat = "hh:mm:ss:SSS",
}: XAxisProps) {
  const { classes } = useGanttContext();
  const xScale = useAtomValue(xScaleAtom);
  const marginLeft = useAtomValue(marginLeftAtom);
  const canvasHeight = useAtomValue(canvasHeightAtom);
  const canvasWidth = useAtomValue(canvasWidthAtom);
  const canvas = useAtomValue(canvasAtom);

  const approximateTextWidth = useMemo(() => {
    if (!canvas) {
      return -1;
    }
    return getTextWidth(
      canvas.getContext("2d"),
      labelFormatter(dayjs().format()) as string,
    );
  }, [canvas, dateFormat, labelFormatter]);

  const textPadding = 75;

  const ticksCount =
    approximateTextWidth > 0
      ? Math.round(canvasWidth / (approximateTextWidth + textPadding))
      : 1;

  const xTicks = xScale.ticks(ticksCount);
  const [minTick, maxTick] = xScale.domain();

  if (xTicks.length > 1) {
    dateFormat = smartTimeFormat(
      xTicks[1].getTime() - xTicks[0].getTime(),
      true,
    );
  }
  const ticks = useMemo(
    () =>
      xTicks.map((tick, i) => (
        <g key={i}>
          <line
            className={classes.dottedLine}
            x1={xScale(tick)}
            y1={0}
            x2={xScale(tick)}
            y2={canvasHeight + graphOffset}
          />
          <text
            onClick={() => navigator.clipboard.writeText(tick.toString())}
            className={classes.xAxisLabel}
            textAnchor="middle"
            style={{ cursor: "pointer" }}
            dominantBaseline="hanging"
            transform={`translate(${xScale(tick)},0)`}
          >
            {labelFormatter(dayjs(tick).format(dateFormat))}
          </text>
        </g>
      )),
    [
      canvasHeight,
      classes.dottedLine,
      classes.xAxisLabel,
      dateFormat,
      labelFormatter,
      xScale,
      xTicks,
    ],
  );

  return (
    <g transform={`translate(${marginLeft})`}>
      {ticks}
      <line
        className={classes.dottedLine}
        x1="0"
        y1={canvasHeight + graphOffset}
        x2={canvasWidth}
        y2={canvasHeight + graphOffset}
      />
      {!xTicks.find((tick) => tick.getTime() === minTick.getTime()) && (
        <line
          className={classes.dottedLine}
          x1={0}
          y1={0}
          x2={0}
          y2={canvasHeight + graphOffset}
        />
      )}
      {!xTicks.find((tick) => tick.getTime() === maxTick.getTime()) && (
        <line
          className={classes.dottedLine}
          x1={canvasWidth}
          y1={0}
          x2={canvasWidth}
          y2={canvasHeight + graphOffset}
        />
      )}
    </g>
  );
}
