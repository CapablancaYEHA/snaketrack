import { useLayoutEffect } from "preact/hooks";
import { LandContent } from "@/components/landing/LandContent";

export const Landing = () => {
  let trg = document.getElementById("layoutsdbr");

  useLayoutEffect(() => {
    let trgH = document.getElementById("layouthdr");
    trg?.classList.add("hide");
    trgH?.classList.add("hide");

    return () => {
      trg?.classList.remove("hide");
      trgH?.classList.remove("hide");
    };
  }, [trg]);

  return <LandContent />;
};
