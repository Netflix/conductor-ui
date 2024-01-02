import React, { memo, useContext } from "react";

import { Handle, Position, NodeProps } from "reactflow";
import DeleteButton from "./DeleteButton";
import { FlowContext } from "../WorkflowFlow";
import ForkBranchButton from "./ForkBranchButton";

const ForkNode = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  let icon;
  const { handleAddForkTask, handleDelete } = useContext(FlowContext);
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

      {data.type === "FORK_JOIN" && (
        <ForkBranchButton
          toolbarVisible={data.toolbarVisible}
          taskRef={id}
          handleAddForkTask={handleAddForkTask!}
        />
      )}

      <DeleteButton
        toolbarVisible={data.toolbarVisible}
        nodeWidth={data.width}
        taskRef={id}
        handleDelete={handleDelete!}
        promptText="This will delete this Fork task and all of its children tasks, as well as the correspoinding JOIN. Are you sure?"
      />
    </>
  );
};

export default memo(ForkNode);
