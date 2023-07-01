import { animated, useSpring } from 'react-spring';
import {
    canvasAtom,
    canvasWidthAtom,
    colorScaleAtom,
    marginLeftAtom,
    useBarIdsOnChange,
    xScaleAtom,
    yScaleAtom,
} from '../atoms';
import { colors } from '@hawkins/variables';
import { getTextWidth } from '../internal/utils';
import {
    idAccessor,
    xt1Accessor,
    xt2Accessor,
    xw1Accessor,
    yAccessor,
} from '../utils';
import { useAtomValue } from 'jotai';
import { useResetDrag } from '../internal/hooks';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import dayjs from 'dayjs';
import type { Datum, Series } from '../types';
import type { EventHandler } from 'react';

export interface BarsProps {
    /**
     * NOTE: should be sorted
     */
    data: Series[];
    barHeight: number;
    waitHeightDelta: number;
    alignmentRatioAlongYBandwidth: number;
    onSpanClick?: (datum: Datum, series: Series) => void;
    labelFormatter?: (label: string | number) => string | number;
    hideLabel?: boolean;
    hideWait?: boolean;
    font?: string;
}

export function Bars({
    onSpanClick,
    data,
    labelFormatter,
    barHeight,
    waitHeightDelta,
    alignmentRatioAlongYBandwidth,
    hideWait = false,
    hideLabel = false,
    font: inputFont = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
}: BarsProps) {
    useBarIdsOnChange()(data.map(yAccessor));

    const xScale = useAtomValue(xScaleAtom);
    const yScale = useAtomValue(yScaleAtom);
    const marginLeft = useAtomValue(marginLeftAtom);
    const canvasWidth = useAtomValue(canvasWidthAtom);

    const resetDrag = useResetDrag();

    const colorScale = useAtomValue(colorScaleAtom);

    const deltaX = (datum: Datum) => {
        const t1 = xt1Accessor(datum);
        const t2 = xt2Accessor(datum);
        return dayjs(t2).diff(t1);
    };

    const widthX = useCallback(
        (datum: Datum) => {
            const t1 = xScale(xt1Accessor(datum));
            const t2 = xScale(xt2Accessor(datum));
            return Math.max(t2 - t1, 2);
        },
        [xScale]
    );

    const widthW = useCallback(
        (datum: Datum) => {
            const w1 = xScale(xw1Accessor(datum));
            const t1 = xScale(xt1Accessor(datum));
            return Math.max(t1 - w1, 2);
        },
        [xScale]
    );

    const scaledW1 = useCallback(
        (datum: Datum) => xScale(xw1Accessor(datum)),
        [xScale]
    );

    const scaledX1 = useCallback(
        (datum: Datum) => xScale(xt1Accessor(datum)),
        [xScale]
    );

    const scaledY = useCallback(
        (data: Series) => yScale(idAccessor(data)),
        [yScale]
    );

    const ctx = useAtomValue(canvasAtom)?.getContext('2d');
    const textRef = useRef<SVGTextElement>();

    const [font, setFont] = useState(inputFont);

    useEffect(() => {
        if (textRef.current && !inputFont) {
            //setFont(window.getComputedStyle(textRef.current).font);
        }
    }, [textRef, inputFont]);

    const springStyles = useSpring({
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
    });

    const bars = useMemo(
        () =>
            data
                .map((series, idx) => {
                    let rightNeighborXPos = Number.MAX_SAFE_INTEGER;
                    // NOTE: this assumes this is sorted and thus paints from right to left
                    return [...series.data].reverse().map((datum) => {
                        const label =
                            labelFormatter?.(deltaX(datum)) || deltaX(datum);

                        const width = widthX(datum);
                        const textElementWidth = getTextWidth(
                            ctx,
                            label as string,
                            font
                        );
                        const textPadding = 5;
                        const textWidth = textElementWidth + textPadding;
                        // TODO does this correctly help us calculate if text will
                        //      fit within a span?
                        const centerOfText = textWidth / 2;
                        // TODO this may be accurately, does the text fall off of
                        // the center (or touch the wall of) of the span with padding?
                        const textIsGreaterThanWidth =
                            centerOfText + width / 2 > width;
                        const textX = textIsGreaterThanWidth
                            ? width + 4
                            : width / 2 - centerOfText;
                        // TODO this should account for potential color-based style fills
                        //      OR be an external function that expects a hex color?
                        const colorFill = colorScale(
                            yAccessor(series)
                        ) as string;

                        const textFill = textIsGreaterThanWidth
                            ? colors.grayLight4
                            : getContrastYIQ(colorFill);

                        const w1Pos = scaledW1(datum);
                        const x1Pos = scaledX1(datum);

                        const x2Pos = w1Pos + x1Pos + width;

                        if (w1Pos > canvasWidth && x2Pos < 0) {
                            // outside of left / right bounds so don't render
                            return null;
                        }

                        const renderText = (() => {
                            if (hideLabel) {
                                return false;
                            }
                            return textIsGreaterThanWidth
                                ? x1Pos + width + textWidth + 4 <
                                      rightNeighborXPos
                                : true;
                        })();

                        rightNeighborXPos = Math.min(w1Pos, x1Pos);

                        const onClick: EventHandler<any> = onSpanClick
                            ? (e) => {
                                  e.preventDefault();
                                  onSpanClick(datum, series);
                                  resetDrag();
                              }
                            : null;

                        const key = `${idAccessor(series)}_${datum.id}`;

                        const bandwidth = yScale.bandwidth();

                        const yPos =
                            scaledY(series) +
                            (bandwidth - barHeight - 4) *
                                alignmentRatioAlongYBandwidth;

                        function onHover(e, i:string, idx:number, mouseOver:boolean){
                            console.log('1',datum, series);
                            let el = document.getElementById(i);
                            let tooltip = document.getElementById(`tooltip${idx}`);
                            console.log(e)
                            if (mouseOver){  
                                el.setAttribute('fill', 'blue');
                                console.log('pos',tooltip.getAttribute("x"), tooltip.getAttribute("y"));
                                // tooltip.setAttribute("x", `${parseInt(e.clientX)+2000}`);
                                tooltip.style.transform = `translate(${parseInt(e.clientX)-marginLeft-100}px, 0px)`
                                tooltip.setAttribute("visibility", "visible");
                            }else{
                                el.setAttribute('fill', 'green');
                                tooltip.setAttribute("visibility", "hidden");
                            }
                                        
                        

                        }

                        return ( x2Pos < marginLeft? null:
                            
                            <animated.g  onMouseEnter={(e)=>onHover(e, key, idx, true)} onMouseLeave={(e)=>onHover(e, key, idx, false)}
                                key={key}
                                id={key}
                                transform={`translate(0, ${yPos || 0})`}
                                className={series?.styles?.band?.className}
                                style={{
                                    ...(series?.styles?.band?.style || {}),
                                    ...springStyles,
                                    
            
                                    cursor: onSpanClick ? 'pointer' : 'inherit',
                                }}
                                fill={colorFill}
                                onClick={onClick}
                            >
                                
                                {datum.w1 && w1Pos < x1Pos && !hideWait && (
                                    <g transform={`translate(${w1Pos}, 1)`}>
                                        <rect  
                                            className={
                                                datum?.styles?.waitSpan
                                                    ?.className
                                            }
                                            style={{
                                                ...(datum?.styles?.waitSpan
                                                    ?.style || {}),
                                                cursor: onSpanClick
                                                    ? 'pointer'
                                                    : 'inherit',
                                            }}
                                            height={barHeight - waitHeightDelta}
                                            width={widthW(datum)}
                                            opacity={0.5}
                                            rx="1"
                                        />
                                    </g>
                                )}
                                <g
                                    transform={`translate(${x1Pos})`}
                                    onClick={onClick}
                                >
                                    
                                    <rect
                                        className={
                                            datum?.styles?.span?.className
                                        }
                                        style={{
                                            ...(datum?.styles?.span?.style ||
                                                {}),
                                            cursor: onSpanClick
                                                ? 'pointer'
                                                : 'inherit',
                                        }}
                                        height={barHeight}
                                        width={width}
                                        rx="2"
                                    />
                                    

                                    {renderText && (
                                        <text
                                            ref={textRef}
                                            className={
                                                textIsGreaterThanWidth
                                                    ? datum?.styles
                                                          ?.spanLabelExternal
                                                          ?.className
                                                    : datum?.styles
                                                          ?.spanLabelInternal
                                                          ?.className
                                            }
                                            style={{
                                                ...(textIsGreaterThanWidth
                                                    ? datum?.styles
                                                          ?.spanLabelExternal
                                                          ?.style
                                                    : datum?.styles
                                                          ?.spanLabelInternal
                                                          ?.style),
                                                ...{
                                                    font:
                                                        inputFont || 'inherit',
                                                    userSelect: 'none',
                                                    WebkitUserSelect: 'none',
                                                    cursor: onSpanClick
                                                        ? 'pointer'
                                                        : 'inherit',
                                                },
                                            }}
                                            fill={textFill}
                                            dominantBaseline="middle"
                                            transform={`translate(${textX}, ${
                                                Math.round(barHeight / 2) + 2
                                            })`}
                                            onClick={onClick}
                                        >
                                            {label}ms
                                        </text>
                                        

                                    )}
                                    <g id={`tooltip${idx}`} visibility="hidden">
                                        {/* <svg width='250px' height='250px' viewBox='0 -90 200 110'> */}
                                    <rect x="0" y="-90" width={`${Math.max(getTextWidth(ctx, series.referenceTaskName),200)}px`} height="100px" viewBox='0 0 200 200' stroke="black" fill="#fffef2" rx="5" />
                                    <text x="10" y="-60" width="50px" height="20px" fill="black"  font-size="13" style={{overflow: 'hidden'}} >{series.referenceTaskName}</text>
                                    <text x="10" y="-30" width="20" height="20" fill="black"  font-size="13"  >{series.taskType}</text>
                                    <text x="10" y="0" width="20" height="20" fill="black"  font-size="13"  >{series.status}</text>
                                    {/* </svg> */}
                                    </g>
                                </g>
                            </animated.g>
                        );
                    });
                })
                .filter(Boolean),
        [
            alignmentRatioAlongYBandwidth,
            barHeight,
            canvasWidth,
            colorScale,
            ctx,
            data,
            font,
            hideLabel,
            hideWait,
            inputFont,
            labelFormatter,
            onSpanClick,
            resetDrag,
            scaledW1,
            scaledX1,
            scaledY,
            springStyles,
            waitHeightDelta,
            widthW,
            widthX,
            yScale,
        ]
    );

    return <g transform={`translate(${marginLeft})`}>{bars}</g>;
}

function getContrastYIQ(hexcolor: string) {
    if (hexcolor[0] === '#') {
        hexcolor = hexcolor.substr(1);
    }
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? colors.grayDark4 : colors.white;
}
