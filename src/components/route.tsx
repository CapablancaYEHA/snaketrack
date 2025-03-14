import { Route, useLocation } from "preact-iso";
import { isEmpty } from "lodash-es";
import { AddSnake } from "../pages/AddSnake";
import { Dashboard } from "../pages/Dashboard";
import { Snake } from "../pages/Snake";
import { SnakeList } from "../pages/SnakeList";
import { Profile } from "../pages/auth/Profile";

export const ProtectedRoute = (props) => {
  const location = useLocation();

  if (!props.session) {
    location.route("/login");
  }

  return <Route {...props} />;
};

export const RedirectiveRoute = (props) => {
  const location = useLocation();

  if (props.session && !isEmpty(props.session?.user)) {
    location.route("/dashboard");
  }

  return <div />;
};

export const protectedRoutes = {
  "/dashboard": Dashboard,
  "/profile": Profile,
  "/snakes": SnakeList,
  "/snakes/:id": Snake,
  "/add/:type": AddSnake,
};

export const sidebarLinks = [
  { id: 1, link: "/dashboard" },
  { id: 2, link: "/snakes" },
];
