import { dragAtom, draggingAtom } from "../atoms";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUpdateAtom } from "jotai/utils";
import type { WritableAtom } from "jotai";

export const useResetDrag = () => {
  const setDrag = useUpdateAtom(dragAtom);
  const setDragging = useUpdateAtom(draggingAtom);
  return useCallback(() => {
    setDrag([-1, -1]);
    setDragging(false);
  }, [setDrag, setDragging]);
};

export function useDimensions(element: HTMLElement): DOMRectReadOnly {
  const [size, setSize] = useState<DOMRectReadOnly>(null);
  const observerRef = useRef(
    new ResizeObserver((entries) => {
      const contentRect = entries[0].contentRect;
      if (
        (contentRect && contentRect.height !== size?.height) ||
        contentRect.width !== size?.width
      ) {
        setSize(contentRect);
      }
    }),
  );

  useEffect(() => {
    if (element) {
      const observer = observerRef.current;
      observer.observe(element);
      return () => observer.unobserve(element);
    }
    return () => {};
  }, [element]);

  return size;
}

const useSetterOnChange = <T>(
  update: (_: T) => void,
  compare: (oldData: T, newData: T) => boolean = () => true,
) =>
  function useSetterOnChange(value: T) {
    const ref = useRef(value);
    useEffect(() => {
      update(value);
      ref.current = value;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
      if (compare(ref.current, value)) {
        update(value);
        ref.current = value;
      }
    }, [value]);
  };

export const useAtomSetterOnChange = <T>(
  atom: WritableAtom<T, T, void>,
  compare: (oldData: T, newData: T) => boolean = () => true,
) => {
  const update = useUpdateAtom(atom);
  return useSetterOnChange(update, compare);
};
