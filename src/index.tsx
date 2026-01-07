import { render } from "preact";
import { signal } from "@preact/signals";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from 'nuqs/adapters/react';
import { Box, LoadingOverlay, MantineProvider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useNotifCookies } from "./utils/useNotifCookies";
import { Pullable } from "./components/common/PullToRefresh/Pullable";
import { Footer } from "./components/navs/Footer";
import { Header } from "./components/navs/Header";
import { Sidebar } from "./components/navs/sidebar/Sidebar";
import { ProtectedRoute, protectedRoutes } from "./components/route";
import { UseOneSignal } from "./lib/client_push";
import { queryClient } from "./lib/client_query";
import { supabase } from "./lib/client_supabase";
import { NotFound } from "./pages/_404";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Reset } from "./pages/auth/Reset";
import { Landing } from "./pages/Landing";
import { Terms } from "./pages/Terms";
import { tabletThreshold, theme } from "./styles/theme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/carousel/styles.css';
import "./styles/global.scss";

const isPending = signal(true);

export function App() {
  const [session, setSession] = useState<any>(null);

  useNotifCookies();
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
	<NuqsAdapter>
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications />
          <Pullable />
          <Header session={session} />
		  <Footer />
		  {isPending.value ? null : !isMwTablet ? <Sidebar /> : null}
          <Box className="box-main" component="main">
            <Router>
				<Route path="/" component={Landing} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/reset" component={Reset} />
			  <Route path="/terms" component={Terms} />
              {isPending.value ? (
                <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 1.0 }} />
              ) : (
                ["/profile", "/snakes", "/snakes/:type?id=:id", "/snakes/add/:type", "/snakes/edit/:type?id=:id","/snakes/import/:type", "/breeding", "/breeding/add/:type",
					"/breeding/:type?id=:id", "/clutches", "/clutches/add/:type", "/clutches/edit/:type?id=:id", "/schedule", "/vivarium", "/vivarium/edit",
					"/market", "/market/add/:type?id=:id", "/market/edit/:type?id=:id", "/market/view/:type?id=:id", "/calculator"].map((a) => (
                  <ProtectedRoute key={a} path={a} session={session} component={protectedRoutes[a]} />
                ))
              )}
              {isPending.value ? (null as any) : <Route default component={NotFound} />}
            </Router>
          </Box>
        </MantineProvider>
      </LocationProvider>
    </QueryClientProvider>
	</NuqsAdapter>
  );
}

render(<App />, document.getElementById("app") as any);
