import { forwardRef } from "preact/compat";
import { Button } from "@mantine/core";
import styles from "./styles.module.scss";

export const Btn = forwardRef<any, any>((props, ref) => {
  return <Button size={props.size || "xs"} {...props} className={styles.special} c="white" ref={ref} />;
});
