// TODO gauge between runtime / queue wait time @ top (other svg)
// TODO once working, place into its own module for sharing via nflx npm
import { DraggableSVG } from "./draggable-svg";
import { GanttContext } from "../internal/gantt-context";
import { InteractionsDiv } from "./interactions-div";
import {
  useBandOnChange,
  useGraphWidthOnChange,
  useMarginsOnChange,
  useMaxOnChange,
  useMinOnChange,
  useScopedMinMaxOnChange,
} from "../atoms";
import { useDimensions } from "../internal/hooks";
import { useStyles } from "./styles";
import React, { useRef } from "react";
import type { GanttProps } from "../types";
import type { PropsWithChildren } from "react";

/**
NOTE: order of svg children is important as of today given gantt-chart 
      uses no reflection to order blanket things like canvas, cursor, or highlight.
      if not accounted for, certain elements may be hidden behind others.
*/
export function GanttChart({
  max = new Date(),
  min = new Date(0),
  band = {
    height: 22,
    padding: 15,
  },
  viewportRef,
  margins = {
    top: 0,
    left: 20,
    right: 50,
    bottom: 50,
  },
  style,
  className,
  children,
}: PropsWithChildren<GanttProps>) {
  const classes = useStyles();

  const ref = useRef<HTMLDivElement>();

  useMaxOnChange()(max);
  useMinOnChange()(min);
  useBandOnChange()(band);
  useMarginsOnChange()(margins);
  useScopedMinMaxOnChange()([min, max]);
  useGraphWidthOnChange()(useDimensions(ref.current)?.width);

  return (
    <GanttContext.Provider
      value={{
        ref,
        classes,
        viewportRef,
      }}
    >
      <div ref={ref} className={className} style={style}>
        <InteractionsDiv />
        <DraggableSVG>{children}</DraggableSVG>
      </div>
    </GanttContext.Provider>
  );
}
