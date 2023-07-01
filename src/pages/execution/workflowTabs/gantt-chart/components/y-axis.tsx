import { defaultFormatter, idAccessor, yAccessor } from '../utils';
import {
    rowsAtom,
    yScaleAtom,
} from '../atoms';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Series } from '../types';

export interface YAxisProps {
    rows: Pick<Series, 'id' | 'label' | 'labelSvgIcon' | 'styles'>[];
    marginRight?: number;
    onLabelClick?: (arg0: Pick<Series, 'id' | 'label'>) => void;
    labelFormatter?: (label: string | number) => string | number;
    font?: string;
    collapsibleRows: Set<string>;
    toggleRow: (arg0:string)=>void;
    taskExpanded: Map<string, boolean>;
    selectedTaskId:string;
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
    // TODO connect this with the y-axis labels
    // font: inputFont = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    children,
}: PropsWithChildren<YAxisProps>) {
    const [currRows, setRows] = useAtom(rowsAtom);
    const [loading, setLoading] = useState(true);
    const [canScroll, setCanScroll] = useState(selectedTaskId?true:false);
    const yAxisLabelPadding = 20;
    const yAxisWidth = 250;
    const marginLeft = yAxisWidth + yAxisLabelPadding;
    const yScale = useAtomValue(yScaleAtom);

    useEffect(()=>{
        setLoading(false);
    }, [])
    
    useEffect(() => {
        if (setRows) {
            const setA = new Set(inputRows.map(yAccessor).map(labelFormatter));
            const setB = new Set(currRows.map(yAccessor));
            if (!isSuperset(setA, setB)) {
                const newRows = inputRows.map((row) => ({
                    ...row,
                    label: labelFormatter(yAccessor(row)) as string,
                }));
                // TODO: this is a hack to get the rows to render in the correct order (as the correct order is reversed atm) 06/01/2023
                setRows([...newRows]);
            }
        }
    }, [currRows, inputRows, labelFormatter, setRows]);

    useEffect(()=>{
        if (selectedTaskId && !loading && canScroll){
            document.getElementById(selectedTaskId)!.scrollIntoView({behavior:'smooth'});
            setCanScroll(false);
        }
    }, [selectedTaskId, loading])

    const currRowsMap = currRows.reduce((agg, row) => {
        agg.set(idAccessor(row), yAccessor(row));
        return agg;
    }, new Map<string, string>());

    const getRow = (band: string) => inputRows.find(({ id }) => id === band);
    
    return (
        <g>
            <svg x='0' y='0' height='100%' width='270px'  style={{backgroundColor:'green'}}>
            <rect x='0' y='0' height='100%' width='270px' fill='white'></rect>
            {yScale.domain().map((band) => {
                const row = getRow(band);
                return (
                    <svg>
                    <svg x='0' y='0' height='100%' width='240px' >
                    <g key={band} >
                        {row?.labelSvgIcon && (
                            <g transform={`translate(5, ${yScale(band)})`}>
                                {row.labelSvgIcon}
                                
                            </g>
                        )}
                        
                        <g
                            transform={`translate(${
                                marginLeft - marginRight
                            }, ${yScale(band) + yScale.bandwidth() / 2})`}
                        >
                             
                            <text id={band}
                                
                                style={{
                                    ...(row?.styles?.band?.style || {}),
                                    cursor:
                                        onLabelClick || children || collapsibleRows.has(band)
                                            ? 'pointer'
                                            : 'inherit',
                                }}
                                transform={`translate(${
                                    -marginLeft+20},
                                0)`}
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
                                
                               {collapsibleRows.has(band)?(taskExpanded.get(band)? '\u25BC':'\u25BA'):null} {currRowsMap.get(band)}
                            </text>
                            
                        </g>
                    </g>                    
                    </svg>
                    <svg>
                    <circle
                            style={{cursor: 'pointer'}}
                            onClick={()=>(navigator.clipboard.writeText(currRowsMap.get(band)))} cx={`${marginLeft-15}`} cy={`${yScale(band) + yScale.bandwidth() / 2}`} r="5" fill='darkGrey' />
                    </svg>
                    </svg>
                );
            })}
            </svg> 
            
        </g>
    );
}

function isSuperset(setA: Set<unknown>, setB: Set<unknown>): boolean {
    if (setA.size !== setB.size) {
        return false;
    }
    
    for (const item of setA.values()) {
        if (!setB.has(item)) {
            return false;
        }
    }
    return true;
}
