import {
  canvasHeightAtom,
  cursorXAtom,
  cursorYAtom,
  dragAtom,
  draggingAtom,
  graphHeightAtom,
  graphWidthAtom,
  marginLeftAtom,
  useMargins,
} from "../atoms";
import { getClientX, getClientY } from "../internal/utils";
import { useAtom } from "jotai";
import { useAtomCallback, useAtomValue, useUpdateAtom } from "jotai/utils";
import { useGanttContext } from "../internal/gantt-context";
import { useResetDrag } from "../internal/hooks";
import React, { useCallback } from "react";
import type { PropsWithChildren } from "react";

export const DraggableSVG = ({ children }: PropsWithChildren<unknown>) => {
  const { ref } = useGanttContext();

  const graphWidth = useAtomValue(graphWidthAtom);
  const graphHeight = useAtomValue(graphHeightAtom);
  const canvasHeight = useAtomValue(canvasHeightAtom);
  const marginLeft = useAtomValue(marginLeftAtom);

  const [dragStart, dragEnd] = useAtomValue(dragAtom);
  const [dragging, setDragging] = useAtom(draggingAtom);

  const setCursorX = useUpdateAtom(cursorXAtom);
  const setCursorY = useUpdateAtom(cursorYAtom);
  const getRootLeft = useCallback(
    () => ref.current?.getBoundingClientRect().left || 0,
    [ref],
  );
  const adjustForRootLeft = useCallback(
    (x: number) => x - getRootLeft(),
    [getRootLeft],
  );
  const adjustForRootTop = useCallback(
    (y: number) => {
      const top = ref.current?.getBoundingClientRect()?.top || 0;
      return y - top;
    },
    [ref],
  );

  const updateDrag = useAtomCallback(
    useCallback(
      (get, set, x: number) => {
        const [dragStart] = get(dragAtom);
        x = adjustForRootLeft(x);
        if (dragStart === -1) {
          set(dragAtom, [x, x]);
        } else {
          set(dragAtom, [dragStart, x]);
        }
      },
      [adjustForRootLeft],
    ),
  );

  const updateDragFromEvent = (e: React.MouseEvent<SVGSVGElement>) => {
    const x = getClientX(e);
    const y = getClientY(e);
    const parentY = ref.current.getBoundingClientRect().y;
    if (x > getRootLeft() + marginLeft && y <= canvasHeight + parentY) {
      e.preventDefault();
      updateDrag(x);
    }
  };

  const resetDrag = useResetDrag();

  const marginRight = useMargins().right || 50;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={graphWidth}
      height={graphHeight}
      onMouseDown={(event) => {
        if (!dragging || dragStart !== -1 || dragEnd !== -1) {
          resetDrag();
        }
        if (getClientX(event) > getRootLeft() + marginLeft) {
          updateDragFromEvent(event);
          setDragging(true);
        }
      }}
      onMouseMove={(event) => {
        const isBeyondLeftMargin =
          getClientX(event) > getRootLeft() + marginLeft;
        if (dragging && isBeyondLeftMargin) {
          updateDragFromEvent(event);
        }
        if (
          isBeyondLeftMargin &&
          getClientX(event) < getRootLeft() + graphWidth - marginRight
        ) {
          setCursorX(adjustForRootLeft(getClientX(event)));
          setCursorY(adjustForRootTop(getClientY(event)));
        } else {
          setCursorX(-1);
          setCursorY(-1);
        }
      }}
      onMouseUp={(event) => {
        updateDragFromEvent(event);
        setDragging(false);
      }}
    >
      {children}
    </svg>
  );
};
