import {
  highlightActionsAtom,
  leftDragAtom,
  rightDragAtom,
  yAxisActionsAtom,
  yAxisSelectedLabelAtom,
} from "../atoms";
import { useAtomValue } from "jotai/utils";
import React from "react";

export const InteractionsDiv = () => {
  // MARK - hover params
  const leftDrag = useAtomValue(leftDragAtom);
  const rightDrag = useAtomValue(rightDragAtom);
  const highlightActions = useAtomValue(highlightActionsAtom);

  // MARK - yaxis params
  const yAxisActions = useAtomValue(yAxisActionsAtom);
  const yAxisSelectedLabel = useAtomValue(yAxisSelectedLabelAtom);

  return (
    <>
      {yAxisSelectedLabel && yAxisActions}
      {leftDrag !== rightDrag && highlightActions}
    </>
  );
};
