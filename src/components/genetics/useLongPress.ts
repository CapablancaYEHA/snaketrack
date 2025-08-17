import { useEffect, useMemo, useRef } from "preact/hooks";

export interface UseLongPressOptions {
  threshold?: number;
  onStart?: (event: MouseEvent | TouchEvent) => void;
  onFinish?: (event: MouseEvent | TouchEvent) => void;
  onCancel?: (event: MouseEvent | TouchEvent) => void;
}

export interface UseLongPressReturnValue {
  onMouseDown: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
  onMouseLeave: (event: MouseEvent) => void;
  onTouchStart: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;
}

export function useLongPress(onLongPress: (event: MouseEvent | TouchEvent) => void, options: UseLongPressOptions = {}): UseLongPressReturnValue {
  const { threshold = 400, onStart, onFinish, onCancel } = options;
  const isLongPressActive = useRef(false);
  const isPressed = useRef(false);
  const timeout = useRef<number>(-1);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  return useMemo(() => {
    if (typeof onLongPress !== "function") {
      return {} as UseLongPressReturnValue;
    }

    const start = (event: MouseEvent | TouchEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) {
        return;
      }

      if (onStart) {
        onStart(event);
      }

      isPressed.current = true;
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        isLongPressActive.current = true;
      }, threshold);
    };

    const cancel = (event: MouseEvent | TouchEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) {
        return;
      }

      if (isLongPressActive.current) {
        if (onFinish) {
          onFinish(event);
        }
      } else if (isPressed.current) {
        if (onCancel) {
          onCancel(event);
        }
      }

      isLongPressActive.current = false;
      isPressed.current = false;

      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }
    };

    return {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
    };
  }, [onLongPress, threshold, onCancel, onFinish, onStart]);
}

function isTouchEvent(event: any): event is TouchEvent {
  return window.TouchEvent ? event.nativeEvent instanceof TouchEvent : "touches" in event.nativeEvent;
}

function isMouseEvent(event: any): event is MouseEvent {
  return event.nativeEvent instanceof MouseEvent;
}
