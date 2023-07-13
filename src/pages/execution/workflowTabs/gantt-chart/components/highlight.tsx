import {
  canvasHeightAtom,
  canvasWidthAtom,
  highlightActionsAtom,
  leftDragAtom,
  marginLeftAtom,
  rightDragAtom,
} from "../atoms";
import { grayDark } from "../../../../../theme/colors";
import { useAtomValue } from "jotai";
import { useGanttContext } from "../internal/gantt-context";
import { useUpdateAtom } from "jotai/utils";
import React, { useCallback, useEffect } from "react";
import type { CSSProperties, PropsWithChildren } from "react";

export function Highlight({ children }: PropsWithChildren<unknown>) {
  const leftDrag = useAtomValue(leftDragAtom);
  const rightDrag = useAtomValue(rightDragAtom);
  const setHighlightActions = useUpdateAtom(highlightActionsAtom);
  const canvasHeight = useAtomValue(canvasHeightAtom);
  const canvasWidth = useAtomValue(canvasWidthAtom);
  const marginLeft = useAtomValue(marginLeftAtom);
  const HighlightActions = useCallback(
    function HighlightActions({ children }: PropsWithChildren<unknown>) {
      const { ref, viewportRef } = useGanttContext();
      const rightDrag = useAtomValue(rightDragAtom);

      const dragActionsStyles: CSSProperties = (() => {
        const marginTop = 8;
        const marginLeft = 10;
        const deltaY =
          canvasHeight > viewportRef.current?.getBoundingClientRect().height
            ? viewportRef.current?.scrollTop +
              ref.current?.getBoundingClientRect().y
            : viewportRef.current?.scrollTop + canvasHeight / 2;

        return {
          top: marginTop + deltaY,
          left: rightDrag + ref.current?.getBoundingClientRect().x + marginLeft,
        };
      })();

      return (
        <div style={{ position: "absolute", ...dragActionsStyles }}>
          {children}
        </div>
      );
    },
    [canvasHeight],
  );

  useEffect(() => {
    setHighlightActions(<HighlightActions>{children}</HighlightActions>);
  }, [HighlightActions, children, setHighlightActions]);

  return leftDrag !== rightDrag ? (
    <g
      style={{
        cursor: "ew-resize",
      }}
    >
      <g transform={`translate(${marginLeft})`}>
        <rect
          fill={grayDark}
          opacity={0.7}
          width={Math.abs(leftDrag - marginLeft)}
          height={canvasHeight}
        />
      </g>
      <g transform={`translate(${leftDrag})`}>
        <rect
          opacity={0}
          width={Math.abs(rightDrag - leftDrag - marginLeft)}
          height={canvasHeight}
        />
      </g>
      <g transform={`translate(${rightDrag})`}>
        <rect
          fill={grayDark}
          opacity={0.7}
          width={canvasWidth - rightDrag + marginLeft}
          height={canvasHeight}
        />
      </g>
    </g>
  ) : (
    <></>
  );
}
