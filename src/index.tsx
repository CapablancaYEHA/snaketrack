import { render } from "preact";
import { signal } from "@preact/signals";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { Box, LoadingOverlay, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";

import { Header } from "./components/navs/Header.js";
import { Sidebar } from "./components/navs/sidebar/Sidebar.js";
import { ProtectedRoute, protectedRoutes } from "./components/route.js";

import { queryClient } from "./lib/client_query.js";
import { supabase } from "./lib/client_supabase.js";
import { UseOneSignal } from "./lib/client_push.js";
import { NotFound } from "./pages/_404.jsx";
import { Login } from "./pages/auth/Login.js";
import { Register } from "./pages/auth/Register.js";
import { Reset } from "./pages/auth/Reset.js";

import { tabletThreshold, theme } from "./styles/theme.js";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/dates/styles.css';
import "./styles/global.scss";


// TODO нужна возможность зайти на страницу змеи по ID но она должна иметь другой презентационный вид, нежели сам пользователь её видит
/* TODO для просмотра другого пользователя использовать таблицу three_cols_profiles, надо её дополнить инфой о змеях на продажу? */
const isPending = signal(true);

export function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: a } }) => {
      setSession(a);
	  if (a?.user?.id) localStorage.setItem("USER", a.user.id);
	  isPending.value = false;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((ev, b) => {
      setSession(b);
		if (b?.user?.id) {
			localStorage.setItem("USER", b.user.id);
		}
    });

    return () => {
      subscription.unsubscribe();
      localStorage.removeItem("USER");
    };
  }, []);

  UseOneSignal(session?.user?.id);

  const isMwTablet = useMediaQuery(tabletThreshold);

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          <Header session={session} />
		  {!isMwTablet ? <Sidebar /> : null}
          <Box component="main" pl={{ base: 'md', sm: "xl", md: 'calc(48px + var(--mantine-spacing-md))',lg: 'md' }} pr={{base: 'md', sm: "xl"}} py={{ base: 'sm', sm: "lg" }} >
		  <Router>
			<Route path="/login"  component={Login} />
			<Route path="/register"  component={Register} />
			<Route path="/reset"  component={Reset} />
				{isPending.value ? (<LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 1.0 }} />)
				: (['/profile','/snakes', '/snakes/:type?id=:id', '/snakes/add/:type','/snakes/edit/:type?id=:id','/breeding',
					'/breeding/add/:type','/breeding/:type?id=:id', '/clutches','/clutches/edit/:type?id=:id'].map(
					(a) => <ProtectedRoute key={a} path={a} session={session} component={protectedRoutes[a]} />)
				)}
				{isPending.value ? ( null as any) : (<Route default component={NotFound}  />)}
		  </Router>
          </Box>
        </MantineProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

render(<App />, document.getElementById("app") as any);
