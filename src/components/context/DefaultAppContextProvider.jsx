import handleError from "../../utils/handleError";
import AppContext from "./AppContext";
import { isEmpty as _isEmpty } from "lodash";

export default function DefaultAppContextProvider({ ...props }) {
  const basename = _isEmpty(props.basename) ? '/' : props.basename;
  
  return (
    <AppContext.Provider
      value={{
        ready: true,
        stack: "default",
        defaultStack: "default",
        customTypeRenderers: {},
        customExecutionSummaryRows: [],
        customTaskSummaryRows: [],
        basename,
        fetchWithContext: function (path, fetchParams) {
          const newParams = { ...fetchParams };

          const newPath = basename + `/api/${path}`;
          const cleanPath = cleanDuplicateSlash(newPath); // Cleanup duplicated slashes

          return fetch(cleanPath, newParams).then(handleError);
        },
      }}
      {...props}
    />
  );
}

export function cleanDuplicateSlash(path) {
  return path.replace(/([^:]\/)\/+/g, "$1");
}