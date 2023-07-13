import type { Datum, Series } from "./types";

export const defaultFormatter = (val: string | number) => val;
export const idAccessor = (data: Partial<Series>): string => data.id;
export const yAccessor = (data: Partial<Series>) => data.label;
export const xw1Accessor = (data: Datum) => data.w1;
export const xt1Accessor = (data: Datum) => data.t1;
export const xt2Accessor = (data: Datum) => data.t2;
