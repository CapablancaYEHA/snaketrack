import { Button } from "@mantine/core";
import styles from "./styles.module.scss";

export const Btn = (props) => {
  return <Button {...props} size="xs" className={styles.special} c="white" />;
};
