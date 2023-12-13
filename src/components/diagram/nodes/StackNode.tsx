import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { makeStyles } from "@mui/styles";
import { Svg, RoundedRect } from "react-svg-path";

const useStyles = makeStyles({
  svg: {
    position: "absolute",
  },
  label: {
    zIndex: 1,
    marginLeft: 5,
    marginTop: 5,
  },
});

const CARD_OFFSET = 5;
const CARD_COUNT = 3;

const StackNode = ({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  const classes = useStyles();
  const { width, height } = data;

  const cardWidth = width - (CARD_COUNT - 1) * CARD_OFFSET;
  const cardHeight = height - (CARD_COUNT - 1) * CARD_OFFSET;
  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />

      <Svg width={width} height={height} className={classes.svg}>
        {Array.from(Array(CARD_COUNT).keys()).map((idx) => (
          <RoundedRect
            key={idx}
            width={cardWidth}
            height={cardHeight}
            cx={cardWidth / 2 + idx * CARD_OFFSET}
            cy={cardHeight / 2 + idx * CARD_OFFSET}
            radius={5}
            stroke="#000"
            strokeWidth={1}
            fill="#fff"
          />
        ))}
        <defs>
          <filter id="outline">
            <feMorphology
              in="SourceAlpha"
              result="expanded"
              operator="dilate"
              radius="4"
            />
            <feFlood floodColor="rgba(0,144,237,.4)" />
            <feComposite in2="expanded" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
      </Svg>

      <div className={classes.label}>
        {data?.label.map((line, idx) => <div key={idx}>{line}</div>)}
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default memo(StackNode);
