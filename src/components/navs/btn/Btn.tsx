import { Button } from "@mantine/core";
import styles from "./styles.module.scss";

export const Btn = (props) => {
  return <Button size={props.size || "xs"} disabled={props.disabled} {...props} className={styles.special} c="white" ref={props.ref} />;
};
