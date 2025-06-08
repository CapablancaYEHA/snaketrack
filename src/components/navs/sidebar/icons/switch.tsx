import { CSSProperties, FC } from "preact/compat";
import { ArrBidirectIcon } from "./ArrBidirect";
import { ArrUpIcon } from "./ArrUp";
import { BinIcon } from "./Bin";
import { CheckIcon } from "./Check";
import { DashIcon } from "./Dash";
import { EggIcon } from "./Egg";
import { FemaleIcon } from "./Female";
import { ImgIcon } from "./Img";
import { KebabIcon } from "./Kebab";
import { MaleIcon } from "./Male";
import { NoDataIcon } from "./NoData";
import { NoFilterIcon } from "./NoFilter";
import { PackIcon } from "./Pack";
import { SearchIcon } from "./Search";

interface IProp {
  icon: string;
  width?: string;
  height?: string;
  style?: CSSProperties;
}

export const IconSwitch: FC<IProp> = ({ icon, width = "20", height = "20", style }) => {
  switch (icon) {
    case "dashboard":
      return <DashIcon width={width} height={height} />;
    case "snakes":
      return <PackIcon width={width} height={height} />;
    case "img":
      return <ImgIcon width={width} height={height} />;
    case "male":
      return <MaleIcon width={width} height={height} style={style} />;
    case "female":
      return <FemaleIcon width={width} height={height} style={style} />;
    case "kebab":
      return <KebabIcon width={width} height={height} />;
    case "breeding":
      return <EggIcon width={width} height={height} />;
    case "check":
      return <CheckIcon width={width} height={height} />;
    case "bin":
      return <BinIcon width={width} height={height} style={style} />;
    case "arr-up":
      return <ArrUpIcon width={width} height={height} style={style} />;
    case "arr-bi":
      return <ArrBidirectIcon width={width} height={height} style={style} />;
    case "no-data":
      return <NoDataIcon width={width} height={height} />;
    case "no-filter":
      return <NoFilterIcon width={width} height={height} />;
    case "search":
      return <SearchIcon width={width} height={height} />;
    default:
      return <DashIcon width={width} height={height} />;
  }
};
