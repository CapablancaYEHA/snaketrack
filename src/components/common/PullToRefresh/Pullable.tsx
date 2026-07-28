import { FC } from "preact/compat";
import { useLayoutEffect, useState } from "preact/hooks";
import { Flex } from "@mantine/core";
import { clsx } from "clsx";
import { IconSwitch } from "@/components/navs/sidebar/icons/switch";
import styles from "./styles.module.scss";

// const magicThr = 50;
const magicStartThr = 45;
const magicNmb = 270;

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

export const Pullable: FC<IPullable> = ({ onRefresh = () => window.location.reload(), refreshDuration = 0 }) => {
  const [status, setStatus] = useState<TPullStatus>("ready");
  const [pullStartY, setPullStartY] = useState<number>(0);
  const [pullMoveY, setPullMoveY] = useState<number>(0);
  const [dist, setDist] = useState<number>(0);
  const [ignoreTouches, setIgnoreTouches] = useState<boolean>(false);

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
    const nmb = e.touches[0].clientY;
    if (nmb >= magicStartThr || ignoreTouches) return;

    setPullStartY(nmb);
  };

  const onTouchMove = (e: TouchEvent): void => {
    if (disabled || ignoreTouches || pullStartY === 0) return;

    setPullMoveY(e.touches[0].screenY);
    if (pullMoveY > 130) {
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
    document.getElementById("layouthdr")?.addEventListener("touchstart", onTouchStart, { passive: true });
    document.getElementById("layouthdr")?.addEventListener("touchmove", onTouchMove, { passive: true });
    document.getElementById("layouthdr")?.addEventListener("touchend", onTouchEnd, { passive: true });

    return (): void => {
      document.getElementById("layouthdr")?.removeEventListener("touchstart", onTouchStart);
      document.getElementById("layouthdr")?.removeEventListener("touchmove", onTouchMove);
      document.getElementById("layouthdr")?.removeEventListener("touchend", onTouchEnd);
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
