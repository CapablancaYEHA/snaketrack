import { Route, useLocation } from "preact-iso";
import { isEmpty } from "lodash-es";
import { AddBreed } from "@/pages/AddBreed";
import { AddSnake } from "@/pages/AddSnake";
import { BreedList } from "@/pages/BreedList";
import { Dashboard } from "@/pages/Dashboard";
import { EditBreed } from "@/pages/EditBreed";
import { EditSnake } from "@/pages/EditSnake";
import { Snake } from "@/pages/Snake";
import { SnakeList } from "@/pages/SnakeList";
import { Profile } from "@/pages/auth/Profile";

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
  "/snakes/:type?id=:id": Snake,
  "/snakes/add/:type": AddSnake,
  "/snakes/edit/:type?id=:id": EditSnake,
  "/breeding": BreedList,
  "/breeding/add/:type": AddBreed,
  "/breeding/:type?id=:id": EditBreed,
};

export const sidebarLinks = [
  { id: 1, link: "/dashboard" },
  { id: 2, link: "/snakes" },
  { id: 3, link: "/breeding" },
];
