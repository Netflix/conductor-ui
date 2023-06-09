import { Handle, Position } from "reactflow";
// @ts-ignore
import { Kite, Svg, Rect, Circle } from 'react-svg-path'

export const TERMINAL_SIZE = 50;
export const StartNode = ({ data }: { data: any }) => {
  return <>
    <Svg width={TERMINAL_SIZE} height={TERMINAL_SIZE}>
      <Circle size={TERMINAL_SIZE-1}
        cx={TERMINAL_SIZE/2}
        cy={TERMINAL_SIZE/2}
        stroke="#000"
        strokeWidth={1}
        fill="#eee"
      />
      <text x={TERMINAL_SIZE / 2} y={TERMINAL_SIZE / 2} textAnchor="middle" alignmentBaseline="middle" fill="#000" fontSize={14} fontWeight="bold">start</text>

      </Svg>
      <Handle
      type="source"
      position={Position.Bottom}
      id={`${data.id}.bottom`}
      />

  </>
};

export const FinalNode = ({ data }: { data: any }) => {
  return (
    <>
      <Svg width={TERMINAL_SIZE} height={TERMINAL_SIZE}>

        <Circle size={TERMINAL_SIZE-1}
          cx={TERMINAL_SIZE/2}
          cy={TERMINAL_SIZE/2}
          stroke="#000"
          strokeWidth={1}
          fill="#eee"
        />
        <text x={TERMINAL_SIZE / 2} y={TERMINAL_SIZE / 2} textAnchor="middle" alignmentBaseline="middle" fill="#000" fontSize={14} fontWeight="bold">final</text>

      </Svg>
      <Handle
        type="target"
        position={Position.Top}
        id={`${data.id}.top`}
      />

    </>
  );
};

export const SWITCH_WIDTH = 300;
export const SWITCH_HEIGHT = 80;
export const SWITCH_LAYOUT_WIDTH = 80;

export const SwitchNode = ({ id, data }: any) => {
  return <div>
    <Handle type="target" position={Position.Top} />

    <Svg width={SWITCH_WIDTH} height={SWITCH_HEIGHT} style={{ position: 'relative', left: -(SWITCH_WIDTH - SWITCH_LAYOUT_WIDTH) / 2 }}>
      <Kite
        width={SWITCH_WIDTH}
        height={SWITCH_HEIGHT}
        dh={SWITCH_HEIGHT / 2}
        cx={SWITCH_WIDTH / 2}
        cy={SWITCH_HEIGHT / 2}
        stroke="#0e98dd"
        strokeWidth={1}
        fill="#fff"
      />
      <text x={SWITCH_WIDTH / 2} y={SWITCH_HEIGHT / 2} textAnchor="middle" alignmentBaseline="middle" fill="#0e98dd" fontSize={14} fontWeight="bold">{data.label}</text>

      <Rect width={SWITCH_WIDTH} height={SWITCH_HEIGHT} cx={SWITCH_WIDTH / 2} cy={SWITCH_HEIGHT / 2}
        stroke="#0e98dd"
        strokeWidth={1}
        fill="none" />
    </Svg>
    <Handle type="source" position={Position.Bottom} />
  </div>
};