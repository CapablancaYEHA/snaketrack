import { useEffect, useRef, useState } from "preact/hooks";

export const useDrag = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const initialPos = useRef({ x: 0, y: 0, objX: 0, objY: 0 });

  const onMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    e.stopPropagation();
    setDragging(true);
    initialPos.current = {
      x: e.clientX,
      y: e.clientY,
      objX: parseInt(ref.current.style.left),
      objY: parseInt(ref.current.style.top),
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const initial = initialPos.current;

    const xDelta = e.clientX - initial.x;
    const yDelta = e.clientY - initial.y;

    ref.current.style.left = `${initial.objX + xDelta}px`;
    ref.current.style.top = `${initial.objY + yDelta}px`;
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  // disable userSelect so text doesn't get selected when dragging
  useEffect(() => {
    if (dragging) {
      window.document.body.style.userSelect = "none";
    } else {
      window.document.body.style.userSelect = "";
    }
  }, [dragging]);

  useEffect(() => {
    if (!ref.current) return;
    const currentRef = ref.current;
    ref.current.addEventListener("mousedown", onMouseDown);

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    return () => {
      if (!currentRef) return;
      currentRef.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref, dragging]);

  return { ref, active: dragging };
};
