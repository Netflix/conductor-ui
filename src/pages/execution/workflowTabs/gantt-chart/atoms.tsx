import { atom, useAtomValue } from "jotai";
import { getTextWidth } from "./internal/utils";
import { fontFamily, fontSizes } from "../../../../theme/variables";
import { idAccessor, yAccessor } from "./utils";
import { scaleBand, scaleOrdinal, scaleTime, schemeGreens } from "d3";
import { useAtomSetterOnChange } from "./internal/hooks";
import React from "react";
import isEqual from "lodash/isEqual";
import type { Band, Margins, Series } from "./types";

// MARK - html elements

export const canvasAtom = atom<HTMLCanvasElement>(null as HTMLCanvasElement);
canvasAtom.onMount = (setAtom) => {
  const canvas = document.createElement("canvas");
  setAtom(canvas);
  return () => canvas.remove();
};

// MARK - props data atoms

export const maxAtom = atom(new Date());

export const minAtom = atom(new Date(0));

export const bandAtom = atom<Band>({
  height: 45,
  padding: 15,
});

export const marginsAtom = atom<Margins>({
  top: 0,
  left: 20,
  right: 50,
  bottom: 50,
});

export const rowsAtom = atom<Pick<Series, "id" | "label">[]>([]);

export const scopedMinMaxAtom = atom<[Date, Date]>([new Date(0), new Date()]);

export const barIdsAtom = atom<string[]>([]);

// MARK - graph measurements atoms

export const graphWidthAtom = atom(0, null);

export const totalBandHeightAtom = atom((get) => {
  const rows = get(rowsAtom);
  const { height } = get(bandAtom);
  return rows.length * height;
});

export const totalBandPaddingAtom = atom((get) => {
  const rows = get(rowsAtom);
  const { padding } = get(bandAtom);
  return (rows.length + 1) * padding;
});

export const yAxisHeightAtom = atom(
  (get) => get(totalBandHeightAtom) + get(totalBandPaddingAtom),
);

export const marginLeftAtom = atom((get) => {
  return 270;
});

export const canvasHeightAtom = atom((get) => {
  const canvasHeight = Math.max(52, get(yAxisHeightAtom));
  return Number.isNaN(canvasHeight) ? 0 : canvasHeight;
});

export const canvasWidthAtom = atom((get) => {
  const width = get(graphWidthAtom);
  const left = get(marginLeftAtom);
  const { right } = get(marginsAtom);
  const canvasWidth = Math.max(width - left - right, 0);
  return Number.isNaN(canvasWidth) ? 0 : canvasWidth;
});

export const graphHeightAtom = atom((get) => {
  const { bottom, top } = get(marginsAtom);
  return get(canvasHeightAtom) + bottom + top;
});

export const xScaleAtom = atom((get) => {
  return scaleTime()
    .domain(get(scopedMinMaxAtom))
    .nice()
    .range([0, get(canvasWidthAtom)]);
});

export const yScaleAtom = atom((get) => {
  return scaleBand()
    .domain(get(rowsAtom).map(idAccessor))
    .range([0, get(yAxisHeightAtom)])
    .round(true);
});

export const colorScaleAtom = atom((get) => {
  return scaleOrdinal()
    .domain(get(barIdsAtom))
    .range(schemeGreens[9].slice(6, 7));
});

// MARK - highlight atoms

export const dragAtom = atom<[number, number]>([-1, -1]);

export const draggingAtom = atom(false);

export const leftDragAtom = atom((get) => {
  const [dragStart, dragEnd] = get(dragAtom);
  return dragStart > dragEnd ? dragEnd : dragStart;
});

export const rightDragAtom = atom((get) => {
  const [dragStart, dragEnd] = get(dragAtom);
  return dragStart > dragEnd ? dragStart : dragEnd;
});

export const highlightActionsAtom = atom(<></>);

export const cursorXAtom = atom(-1);
export const cursorYAtom = atom(-1);

// MARK - y-axis atoms

export const yAxisActionsAtom = atom(<></>);

export const yAxisSelectedLabelAtom = atom(null);

const notEqual = (a: any, b: any) => !isEqual(a, b);
export const useMaxOnChange = () => useAtomSetterOnChange(maxAtom, notEqual);
export const useMinOnChange = () => useAtomSetterOnChange(minAtom, notEqual);
export const useBandOnChange = () => useAtomSetterOnChange(bandAtom, notEqual);
export const useMarginsOnChange = () =>
  useAtomSetterOnChange(marginsAtom, notEqual);
export const useScopedMinMaxOnChange = () =>
  useAtomSetterOnChange(scopedMinMaxAtom, notEqual);
export const useGraphWidthOnChange = () =>
  useAtomSetterOnChange(graphWidthAtom, notEqual);
export const useBarIdsOnChange = () =>
  useAtomSetterOnChange(barIdsAtom, notEqual);

export const useMargins = () => useAtomValue(marginsAtom);
