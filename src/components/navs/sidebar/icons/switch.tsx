import { FC } from "preact/compat";
import { DashIcon } from "./Dash";
import { FemaleIcon } from "./Female";
import { ImgIcon } from "./Img";
import { KebabIcon } from "./Kebab";
import { MaleIcon } from "./Male";
import { PackIcon } from "./Pack";

interface IProp {
  icon: string;
  width?: string;
  height?: string;
}

export const IconSwitch: FC<IProp> = ({ icon, width = "20", height = "20" }) => {
  switch (icon) {
    case "dashboard":
      return <DashIcon width={width} height={height} />;
    case "snakes":
      return <PackIcon width={width} height={height} />;
    case "img":
      return <ImgIcon width={width} height={height} />;
    case "male":
      return <MaleIcon width={width} height={height} />;
    case "female":
      return <FemaleIcon width={width} height={height} />;
    case "kebab":
      return <KebabIcon width={width} height={height} />;
    default:
      return <DashIcon width={width} height={height} />;
  }
};
