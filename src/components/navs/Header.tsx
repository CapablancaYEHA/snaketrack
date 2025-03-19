import { Box, Title, alpha } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useProfile } from "../../api/profile/hooks";
import { tabletThreshold } from "./const";
import { HeadMenu } from "./headMenu";
import { MobileMenu } from "./mobileMenu";
import styles from "./styles.module.scss";

export function Header() {
  const userId = localStorage.getItem("USER");
  const { data } = useProfile(userId, userId != null);

  const isTablet = useMediaQuery(tabletThreshold);

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
        {isTablet ? (
          <Box mr="lg">
            <MobileMenu />
          </Box>
        ) : null}
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
          <HeadMenu accName={data?.username} />
        </nav>
      </div>
    </Box>
  );
}
