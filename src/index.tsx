import { render } from "preact";
import { signal } from "@preact/signals";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { Box, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";

import { Header } from "./components/navs/Header.js";
import { Sidebar } from "./components/navs/sidebar/Sidebar.js";
import { ProtectedRoute, protectedRoutes } from "./components/route.js";
import { tabletThreshold } from "./components/navs/const.js";
import { queryClient } from "./lib/client_query.js";
import { supabase } from "./lib/client_supabase.js";
import { NotFound } from "./pages/_404.jsx";
import { Login } from "./pages/auth/Login.js";
import { Register } from "./pages/auth/Register.js";
import { UseOneSignal } from "./lib/client_push.js";

import { theme } from "./styles/theme.js";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import '@mantine/dates/styles.css';
import "./styles/global.scss";

/* FIXME для просмотра другого пользователя использовать таблицу three_cols_profiles, надо её дополнить инфой о змеях на продажу */
const isPending = signal(true);

export function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: a } }) => {
      setSession(a);
	  if (a?.user?.id) localStorage.setItem("USER", a.user.id);
	  isPending.value = false;
	//   pushClient(a?.user?.id!);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, b) => {
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

  const isTablet = useMediaQuery(tabletThreshold);

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          {session !=null ? (<Header />) : null}
		  {!isTablet ? <Sidebar /> : null}
          <Box component="main" px="xl" py="lg" >
		  <Router>
			<Route path="/login"  component={Login} />
			<Route path="/register"  component={Register} />
				{isPending.value ? (null as any)
				: (['/dashboard','/profile','/snakes', '/snakes/:id', '/add/:type','/edit/:type?id=:id'].map(
					(a) => <ProtectedRoute key={a} path={a} session={session} component={protectedRoutes[a]} />)
				)}
				{isPending.value ?  null : (<Route default component={NotFound}  />)}
		  </Router>
          </Box>
        </MantineProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

render(<App />, document.getElementById("app") as any);
