import React, { memo, useContext } from "react";

import { Handle, Position, NodeProps } from "reactflow";
import { FlowContext } from "../WorkflowFlow";
import InsertButton from "./InsertButton";

const JoinNode = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  let icon;
  const { handleInsert } = useContext(FlowContext);

  return (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
      />
      <div style={{ display: "flex", flexDirection: "row", gap: 5 }}>
        {icon}
        {data?.label}
      </div>
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
      />
      <InsertButton
        toolbarVisible={data.toolbarVisible}
        taskRef={id}
        handleInsert={handleInsert!}
      />
    </>
  );
};

export default memo(JoinNode);
