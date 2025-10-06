import { render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { Box, LoadingOverlay, MantineProvider } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { signal } from "@preact/signals";
import { QueryClientProvider } from "@tanstack/react-query";
import { Pullable } from "./components/common/PullToRefresh/Pullable";
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
import { tabletThreshold, theme } from "./styles/theme";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./styles/global.scss";


// TODO нужна возможность зайти на страницу змеи по ID но она должна иметь другой презентационный вид, нежели сам пользователь её видит (для магаза?)
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
          <Pullable />
          <Header session={session} />
          {!isMwTablet ? <Sidebar /> : null}
          <Box className="box-main" component="main">
            <Router>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/reset" component={Reset} />
              {isPending.value ? (
                <LoadingOverlay visible zIndex={30} overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 1.0 }} />
              ) : (
                ["/profile", "/snakes", "/snakes/:type?id=:id", "/snakes/add/:type", "/snakes/edit/:type?id=:id", "/breeding", "/breeding/add/:type", "/breeding/:type?id=:id", "/clutches", "/clutches/edit/:type?id=:id", "/schedule", "/market", "/calculator"].map((a) => (
                  <ProtectedRoute key={a} path={a} session={session} component={protectedRoutes[a]} />
                ))
              )}
              {isPending.value ? (null as any) : <Route default component={NotFound} />}
            </Router>
          </Box>
        </MantineProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

render(<App />, document.getElementById("app") as any);
