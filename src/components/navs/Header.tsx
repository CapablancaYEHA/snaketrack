import { tabletThreshold } from "@/styles/theme";
import { Box, Image, Title, alpha } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useProfile } from "../../api/profile/hooks";
import { logoUri } from "./const";
import { HeadMenu } from "./headMenu";
import { MobileMenu } from "./mobileMenu";
import styles from "./styles.module.scss";

export function Header({ session }) {
  const userId = localStorage.getItem("USER");
  const { data } = useProfile(userId, userId != null);

  const isMwTablet = useMediaQuery(tabletThreshold);

  return (
    <Box
      id="layouthdr"
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
        {isMwTablet ? (
          <Box mr="lg">
            <MobileMenu />
          </Box>
        ) : null}
        <a href="/snakes" className={styles.logo}>
          <Title component="span" c="dark.1" order={4}>
            HsssStats
          </Title>
          <Image src={logoUri} fit="cover" w="24" h="24" />
        </a>
        {session != null ? (
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
        ) : null}
      </div>
    </Box>
  );
}
