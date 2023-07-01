import type { Datum, Series } from './types';

export const defaultFormatter = (val: string | number| undefined) => val;
export const idAccessor = (data: Partial<Series>): string => data.id!;
export const yAccessor = (data: Partial<Series>) => data.label;
export const xw1Accessor = (data: Datum) => data.w1;
export const xt1Accessor = (data: Datum) => data.t1;
export const xt2Accessor = (data: Datum) => data.t2;
export const fontFamily = {
    fontFamilySans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
}
export const fontSizes = {
    fontSize3: '14px'
}
