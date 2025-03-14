import { useEffect, useState } from "preact/hooks";
import { Box, Title, alpha } from "@mantine/core";
import { useProfile } from "../../api/profile/hooks";
import { HeadMenu } from "./headMenu";
import styles from "./styles.module.scss";

export function Header({ session }) {
  //   const [id, setId] = useState<string | null>(null);

  //   const { data } = useProfile(id, id != null);

  //   useEffect(() => {
  //     setId(session?.user?.id);
  //   }, [JSON.stringify(session)]);

  return (
    <Box
      bg="dark.8"
      component="header"
      h="50"
      px="xl"
      className={styles.wrap}
      style={{
        borderBottom: `1px solid ${alpha(`var(--mantine-color-yellow-6)`, 0.4)}`,
      }}
    >
      <div>
        <a href="/dashboard" className={styles.logo}>
          {/* <img src={""} alt="logo" /> */}
          <Title component="span" c="white" order={4}>
            HsssStats 🐍
          </Title>
        </a>
        <nav
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            gap: "24px",
          }}
        >
          <HeadMenu title={"fdwdw"} />
        </nav>
      </div>
    </Box>
  );
}
