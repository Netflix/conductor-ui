// ParameterExpressionToggle.js

import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import JsonInput from "../../../../components/JsonInput";

const ParameterExpressionToggle = ({
  parameterOrExpression,
  setParameterOrExpression,
  inputParameters,
  setInputParameters,
  inputExpression,
  setInputExpression,
}) => {
  const handleToggleButtonChange = (event, newSelection) => {
    setParameterOrExpression(newSelection);
  };
  return (
    <div>
      <ToggleButtonGroup
        value={parameterOrExpression}
        exclusive
        onChange={handleToggleButtonChange}
        size="small"
        style={{ marginBottom: "15px" }}
      >
        <ToggleButton value="parameter">
          Define inputParameters statically (default)
        </ToggleButton>
        <ToggleButton value="expression">Use inputExpression</ToggleButton>
      </ToggleButtonGroup>

      {parameterOrExpression === "parameter" && (
        <JsonInput
          key="parameter"
          label="inputParameters"
          value={inputParameters}
          onChange={(v) => setInputParameters(v!)}
        />
      )}
      {parameterOrExpression === "expression" && (
        <JsonInput
          key="expression"
          label="inputExpression"
          language="plaintext"
          value={inputExpression}
          onChange={(v) => setInputExpression(v!)}
        />
      )}
    </div>
  );
};

export default ParameterExpressionToggle;
