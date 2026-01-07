import { Route, useLocation } from "preact-iso";
import { useEffect, useLayoutEffect } from "preact/hooks";
import { isEmpty } from "lodash-es";
import { AddBreed } from "@/pages/AddBreed";
import { AddClutch } from "@/pages/AddClutch";
import { AddSnake } from "@/pages/AddSnake";
import { BreedList } from "@/pages/BreedList";
import { Calculator } from "@/pages/Calculator";
import { ClutchList } from "@/pages/ClutchList";
import { EditBreed } from "@/pages/EditBreed";
import { EditClutch } from "@/pages/EditClutch";
import { EditSnake } from "@/pages/EditSnake";
import { EditVivarium } from "@/pages/EditVivarium";
import { ImportSnake } from "@/pages/ImportSnake";
import { Landing } from "@/pages/Landing";
import { Market } from "@/pages/Market";
import { MarketAdd } from "@/pages/MarketAddAvd";
import { MarketAdv } from "@/pages/MarketAdv";
import { MarketEdit } from "@/pages/MarketEditAdv";
import { Schedule } from "@/pages/Schedule";
import { Snake } from "@/pages/Snake";
import { SnakeCategories } from "@/pages/SnakeCategories";
import { Vivarium } from "@/pages/Vivarium";
import { Profile } from "@/pages/auth/Profile";
import { usePwaInformer } from "@/utils/usePwaInformer";

export const ProtectedRoute = (props) => {
  const location = useLocation();

  if (!props.session) {
    location.route("/login");
  }

  usePwaInformer();

  return <Route {...props} />;
};

export const AvoidRoute = (props) => {
  const location = useLocation();

  useLayoutEffect(() => {
    if (props.session && !isEmpty(props.session?.user) && window.location.pathname === "/") {
      location.route("/snakes");
    }
  }, [props.session]);

  return <Route {...props} />;
};

export const protectedRoutes = {
  "/profile": Profile,
  "/snakes": SnakeCategories,
  "/snakes/:type?id=:id": Snake,
  "/snakes/add/:type": AddSnake,
  "/snakes/import/:type": ImportSnake,
  "/snakes/edit/:type?id=:id": EditSnake,
  "/breeding": BreedList,
  "/breeding/add/:type": AddBreed,
  "/breeding/:type?id=:id": EditBreed,
  "/clutches": ClutchList,
  "/clutches/add/:type": AddClutch,
  "/clutches/edit/:type?id=:id": EditClutch,
  "/schedule": Schedule,
  "/market": Market,
  "/market/view/:type?id=:id": MarketAdv,
  "/market/add/:type?id=:id": MarketAdd,
  "/market/edit/:type?id=:id": MarketEdit,
  "/calculator": Calculator,
  "/vivarium": Vivarium,
  "/vivarium/edit": EditVivarium,
};

export const sidebarLinks = [
  { id: 2, link: "/snakes", label: "Змеи" },
  { id: 8, link: "/vivarium", label: "Виварий" },
  { id: 6, link: "/calculator", label: "Калькулятор" },
  { id: 3, link: "/breeding", label: "Бридинг" },
  { id: 4, link: "/clutches", label: "Кладки" },
  { id: 5, link: "/schedule", label: "Расписание" },
  { id: 7, link: "/market", label: "Маркет" },
];
