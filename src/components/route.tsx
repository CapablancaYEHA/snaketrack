import { Route, useLocation } from "preact-iso";
import { isEmpty } from "lodash-es";
import { AddBreed } from "@/pages/AddBreed";
import { AddSnake } from "@/pages/AddSnake";
import { BreedList } from "@/pages/BreedList";
import { ClutchList } from "@/pages/ClutchList";
import { EditBreed } from "@/pages/EditBreed";
import { EditClutch } from "@/pages/EditClutch";
import { EditSnake } from "@/pages/EditSnake";
import { Schedule } from "@/pages/Schedule";
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
    location.route("/snakes");
  }

  return <div />;
};

export const protectedRoutes = {
  "/profile": Profile,
  "/snakes": SnakeList,
  "/snakes/:type?id=:id": Snake,
  "/snakes/add/:type": AddSnake,
  "/snakes/edit/:type?id=:id": EditSnake,
  "/breeding": BreedList,
  "/breeding/add/:type": AddBreed,
  "/breeding/:type?id=:id": EditBreed,
  "/clutches": ClutchList,
  "/clutches/edit/:type?id=:id": EditClutch,
  "/schedule": Schedule,
};

export const sidebarLinks = [
  { id: 2, link: "/snakes" },
  { id: 3, link: "/breeding" },
  { id: 4, link: "/clutches" },
  { id: 5, link: "/schedule" },
];
