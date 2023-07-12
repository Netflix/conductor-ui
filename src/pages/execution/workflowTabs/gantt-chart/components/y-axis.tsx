import { defaultFormatter, idAccessor, yAccessor } from "../utils";
import { rowsAtom, yScaleAtom, canvasWidthAtom } from "../atoms";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Series } from "../types";
import { grayLight6 } from "../../../../../theme/colors";

export interface YAxisProps {
  rows: Pick<Series, "id" | "label" | "labelSvgIcon" | "styles">[];
  marginRight?: number;
  onLabelClick?: (arg0: Pick<Series, "id" | "label">) => void;
  labelFormatter?: (label: string | number) => string | number;
  font?: string;
  collapsibleRows: Set<string>;
  toggleRow: (arg0: string) => void;
  taskExpanded: Map<string, boolean>;
  selectedTaskId: string;
  barHeight?: number;
  alignmentRatioAlongYBandwidth?: number;
}
export function YAxis({
  collapsibleRows,
  toggleRow,
  rows: inputRows,
  onLabelClick,
  marginRight = 8,
  labelFormatter = defaultFormatter,
  taskExpanded,
  selectedTaskId,
  barHeight = 22,
  alignmentRatioAlongYBandwidth = 0.3,
  // TODO connect this with the y-axis labels
  // font: inputFont = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  children,
}: PropsWithChildren<YAxisProps>) {
  const [currRows, setRows] = useAtom(rowsAtom);
  const [loading, setLoading] = useState(true);
  const [canScroll, setCanScroll] = useState(selectedTaskId ? true : false);
  const yAxisLabelPadding = 20;
  const yAxisWidth = 250;
  const marginLeft = yAxisWidth + yAxisLabelPadding;
  const yScale = useAtomValue(yScaleAtom);
  const canvasWidth = useAtomValue(canvasWidthAtom);
  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    const newRows = inputRows.map((row) => ({
      ...row,
      label: labelFormatter(yAccessor(row)) as string,
    }));
    setRows([...newRows]);
  }, [inputRows]);

  useEffect(() => {
    if (selectedTaskId && !loading && canScroll) {
      document
        .getElementById(selectedTaskId)
        .scrollIntoView({ behavior: "smooth" });
      setCanScroll(false);
    }
  }, [selectedTaskId, loading, canScroll]);

  const currRowsMap = currRows.reduce((agg, row) => {
    agg.set(idAccessor(row), yAccessor(row));
    return agg;
  }, new Map<string, string>());

  const getRow = (band: string) => inputRows.find(({ id }) => id === band);
  const bandwidth = yScale.bandwidth();
  return (
    <g transform={`translate(0, 10)`}>
      {/* 10 to prevent axis overlap with x-axis*/}
      <svg x="0" y="0" height="100%" width="270px">
        <rect x="0" y="0" height="100%" width="270px" fill="white" />
        {yScale.domain().map((band, idx) => {
          const row = getRow(band);
          let yPos =
            yScale(band) +
              (bandwidth - barHeight - 4) * alignmentRatioAlongYBandwidth || 0;
          return (
            <svg key={band} x="0" y="0" transform="translate(0,0)">
              {!idx && (
                <line
                  x1={0}
                  y1={yPos}
                  x2={canvasWidth}
                  y2={yPos}
                  stroke={grayLight6}
                />
              )}
              <svg x="0" y="0" height="100%" width="240px">
                <g key={band}>
                  {row?.labelSvgIcon && (
                    <g transform={`translate(5, ${yScale(band)})`}>
                      {row.labelSvgIcon}
                    </g>
                  )}

                  <g
                    transform={`translate(${marginLeft - marginRight}, ${
                      yScale(band) + yScale.bandwidth() / 2
                    })`}
                  >
                    <text
                      id={band}
                      style={{
                        ...(row?.styles?.band?.style || {}),
                        cursor:
                          onLabelClick || children || collapsibleRows.has(band)
                            ? "pointer"
                            : "inherit",
                      }}
                      transform={`translate(${-marginLeft + 20})`}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontWeight="bold"
                      onClick={() => {
                        collapsibleRows.has(band) && toggleRow(band);
                        const key = {
                          id: band,
                          label: currRowsMap.get(band),
                        };
                        onLabelClick?.(key);
                      }}
                    >
                      {collapsibleRows.has(band) &&
                        (taskExpanded.get(band) ? "\u25BC" : "\u25BA")}{" "}
                      {currRowsMap.get(band)}
                    </text>
                  </g>
                </g>
              </svg>
              <svg>
                <circle
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigator.clipboard.writeText(currRowsMap.get(band))
                  }
                  cx={`${marginLeft - 15}`}
                  cy={`${yScale(band) + yScale.bandwidth() / 2}`}
                  r="5"
                  fill="darkGrey"
                />
              </svg>
              <line
                x1={0}
                y1={yPos + barHeight + 17 / 2}
                x2={canvasWidth}
                y2={yPos + barHeight + 17 / 2}
                stroke={grayLight6}
              />
            </svg>
          );
        })}
      </svg>
    </g>
  );
}
