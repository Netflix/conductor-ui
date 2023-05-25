import { useFetch } from "./common";

export const useEventHandlers = () => {
  return useFetch(["event"], "/event");
};

export const useLogs = ({ taskId }: { taskId?: string }) => {
  return useFetch(["taskLog", taskId!], `/tasks/${taskId}/log`, {
    enabled: !!taskId,
  });
};