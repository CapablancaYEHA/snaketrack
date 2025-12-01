import { Flex } from "@mantine/core";
import { clsx } from "clsx";
import { throttle } from "lodash-es";
import React, { useLayoutEffect, useState } from "react";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import styles from "./styles.module.scss";

const magicThr = 50;
const magicNmb = 220;

type TPullStatus = "ready" | "pulling" | "aborted" | "refreshed";

const calcOpacity = (dist: number) => {
  return dist > 60 ? dist / magicNmb : 0;
};

let disabled = false;

interface IPullable {
  refreshDuration?: number;
  onRefresh?(): void;
  disabled?: boolean;
}

export const Pullable: React.FC<IPullable> = ({ onRefresh = () => window.location.reload(), refreshDuration = 0 }) => {
  const [isCan, setCan] = useState(false);
  const [status, setStatus] = useState<TPullStatus>("ready");
  const [pullStartY, setPullStartY] = useState<number>(0);
  const [pullMoveY, setPullMoveY] = useState<number>(0);
  const [dist, setDist] = useState<number>(0);
  const [ignoreTouches, setIgnoreTouches] = useState<boolean>(false);

  useLayoutEffect(() => {
    const calcScrollDistance = throttle(() => {
      const trg = document.querySelector("main.box-main")?.getBoundingClientRect()?.top;
      setCan(!trg || trg === magicThr);
    }, 500);

    document.addEventListener("scroll", calcScrollDistance, { passive: true, capture: true });
    return (): void => {
      document.removeEventListener("scroll", calcScrollDistance);
    };
  }, []);

  const reset = (): void => {
    setStatus("ready");
    setPullStartY(0);
    setPullMoveY(0);
    setDist(0);
    setIgnoreTouches(false);
  };

  const refresh = (): void => {
    setIgnoreTouches(true);
    setTimeout(() => {
      onRefresh();
      setStatus("refreshed");
      reset();
    }, refreshDuration);
  };

  const onTouchStart = (e: TouchEvent): void => {
    if (!isCan || ignoreTouches) return;

    setPullStartY(e.touches[0].screenY);
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (!isCan || disabled || ignoreTouches || pullStartY === 0) return;

    setPullMoveY(e.touches[0].screenY);
    if (pullMoveY > 100) {
      const distance = pullMoveY - pullStartY;
      setDist(distance > 0 ? distance : 0);
      setStatus("pulling");
    }
  };

  const onTouchEnd = (): void => {
    if (disabled || ignoreTouches || status === "ready") return;
    setIgnoreTouches(true);

    if (dist > magicNmb && status === "pulling") {
      refresh();
    } else {
      setStatus("aborted");
      reset();
    }
  };

  useLayoutEffect(() => {
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return (): void => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  });

  return (
    <Flex
      className={clsx(styles.spinner, dist > magicNmb && status === "pulling" && styles["spinner-ready"])}
      justify="center"
      align="center"
      style={{
        opacity: calcOpacity(dist),
        height: `${dist > 100 ? 100 : dist}px`,
        top: dist > 5 ? `calc(-40px + ${dist / 2}px + env(safe-area-inset-top))` : "calc(48px + env(safe-area-inset-top))",
      }}
    >
      <IconSwitch icon="refresh" width="36" height="36" style={{ transform: `rotate(${dist}deg)`, position: "relative" }} />
    </Flex>
  );
};
