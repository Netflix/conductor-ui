import {
  canvasWidthAtom,
  leftDragAtom,
  marginLeftAtom,
  maxAtom,
  minAtom,
  rightDragAtom,
  scopedMinMaxAtom,
  xScaleAtom,
  yScaleAtom,
} from "./atoms";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai/utils";
import { useCallback } from "react";
import { useResetDrag } from "./internal/hooks";

export const useGanttChartAPI = () => {
  const [[scopedMin, scopedMax], setScopedMinMax] = useAtom(scopedMinMaxAtom);

  const max = useAtomValue(maxAtom);
  const min = useAtomValue(minAtom);
  const xScale = useAtomValue(xScaleAtom);
  const yScale = useAtomValue(yScaleAtom);
  const leftDrag = useAtomValue(leftDragAtom);
  const rightDrag = useAtomValue(rightDragAtom);
  const marginLeft = useAtomValue(marginLeftAtom);
  const canvasWidth = useAtomValue(canvasWidthAtom);
  const resetDrag = useResetDrag();
  const resetZoom = useCallback(() => {
    setScopedMinMax([min, max]);
    resetDrag();
  }, [max, min, resetDrag, setScopedMinMax]);

  return {
    min,
    max,
    xScale,
    yScale,
    marginLeft,
    canvasWidth,
    resetZoom,
    isZoomed:
      scopedMin.getTime() !== min.getTime() ||
      scopedMax.getTime() !== max.getTime(),
    scopedMin,
    scopedMax,
    highlightMin: xScale ? xScale.invert(leftDrag - marginLeft) : null,
    highlightMax: xScale ? xScale.invert(rightDrag - marginLeft) : null,
    //selectedLabel: selectedLabel.unwrapOr(null),
    zoom: (dateA: Date, dateB: Date) => {
      setScopedMinMax([dateA, dateB]);
      resetDrag();
    },
    //closeMenu: () => setSelectedLabel(None),
  };
};
