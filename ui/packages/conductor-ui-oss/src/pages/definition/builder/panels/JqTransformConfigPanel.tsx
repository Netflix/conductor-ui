import { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { jqTransformTaskSchema } from "../../../../schema/task/transformTask";
import JsonInput from "../../../../components/JsonInput";
import PanelContainer from "./BasePanel";
import { PanelProps } from "../tabRouter";
import { JqTransformIcon } from "../../../../components/diagram/icons/taskIcons";
import AttributeTable from "../taskconfigurator/AttributeTable";
import {
  normalizeObject,
  parseWithDefault,
} from "../../../../schema/schemaUtils";

const JqTransformConfigPanel = ({
  tabId,
  initialConfig,
  onChanged,
  onUpdate,
}: PanelProps) => {
  const [queryExpression, setQueryExpression] = useState<string>("");
  const [additionalInputParameters, setAdditionalInputParameters] =
    useState<string>("{}");
  const [taskLevelParams, setTaskLevelParams] = useState<any>({});

  // Initialize data sources and state
  useEffect(() => {
    setTaskLevelParams(normalizeObject(jqTransformTaskSchema, initialConfig));

    const { queryExpression, ...rest } = initialConfig.inputParameters || {};
    setQueryExpression(queryExpression || "");
    setAdditionalInputParameters(
      _.isEmpty(rest) ? "" : JSON.stringify(rest, null, 2),
    );

    onChanged(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConfig]);

  const handleApply = useCallback(() => {
    const retval = {
      ...taskLevelParams,
      inputParameters: {
        queryExpression: queryExpression,
        ...parseWithDefault(additionalInputParameters),
      },
    };

    onUpdate(retval);
  }, [onUpdate, taskLevelParams, queryExpression, additionalInputParameters]);

  const handleTaskLevelParamsChange = (updatedJson) => {
    setTaskLevelParams(updatedJson);
    onChanged(true);
  };

  const handleQueryExpressionChange = useCallback(
    (v) => {
      setQueryExpression(v);
      onChanged(true);
    },
    [onChanged],
  );

  const handleAdditionalInputParametersChange = useCallback(
    (v) => {
      setAdditionalInputParameters(v!);
      onChanged(true);
    },
    [onChanged],
  );

  return (
    <PanelContainer
      tabId={tabId}
      handleApply={handleApply}
      heading="JQ Transform Task"
      Icon={JqTransformIcon}
    >
      <div style={{ marginBottom: "15px" }}>
        The JQ Transform task that allows processing of JSON data using the JQ
        query expression language.
      </div>
      <AttributeTable
        schema={jqTransformTaskSchema}
        config={taskLevelParams}
        onChange={handleTaskLevelParamsChange}
        style={{ marginBottom: "30px" }}
      />

      <JsonInput
        label="queryExpression"
        value={queryExpression}
        style={{ marginBottom: "30px" }}
        onChange={handleQueryExpressionChange}
        language="text"
      />
      <JsonInput
        label="Additional inputParameters"
        value={additionalInputParameters}
        onChange={handleAdditionalInputParametersChange}
      />
    </PanelContainer>
  );
};

export default JqTransformConfigPanel;
