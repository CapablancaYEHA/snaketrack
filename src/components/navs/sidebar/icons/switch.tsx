import { CSSProperties, FC } from "preact/compat";
import { AdjustIcon } from "./Adjust";
import { ArrBidirectIcon } from "./ArrBidirect";
import { ArrUpIcon } from "./ArrUp";
import { BinIcon } from "./Bin";
import { CalculatorIcon } from "./Calculator";
import { CalendarIcon } from "./Calendar";
import { CheckIcon } from "./Check";
import { CleanIcon } from "./Clean";
import { DashIcon } from "./Dash";
import { EditIcon } from "./Edit";
import { EggIcon } from "./Egg";
import { FemaleIcon } from "./Female";
import { ImgIcon } from "./Img";
import { KebabIcon } from "./Kebab";
import { MaleIcon } from "./Male";
import { MarketIcon } from "./Market";
import { NoDataIcon } from "./NoData";
import { NoFilterIcon } from "./NoFilter";
import { PackIcon } from "./Pack";
import { PlusIcon } from "./Plus";
import { RefreshIcon } from "./Refresh";
import { RelatedIcon } from "./Related";
import { SearchIcon } from "./Search";
import { UnisexIcon } from "./Unisex";

interface IProp {
  icon: string;
  width?: string;
  height?: string;
  style?: CSSProperties;
  className?: string;
}

export const IconSwitch: FC<IProp> = ({ icon, width = "20", height = "20", style, className }) => {
  switch (icon) {
    case "calculator":
      return <CalculatorIcon width={width} height={height} style={style} />;
    case "edit":
      return <EditIcon width={width} height={height} style={style} />;
    case "refresh":
      return <RefreshIcon width={width} height={height} style={style} />;
    case "clean":
      return <CleanIcon width={width} height={height} style={style} />;
    case "adjust":
      return <AdjustIcon width={width} height={height} />;
    case "dashboard":
      return <DashIcon width={width} height={height} />;
    case "snakes":
      return <PackIcon width={width} height={height} />;
    case "img":
      return <ImgIcon width={width} height={height} />;
    case "male":
      return <MaleIcon width={width} height={height} style={style} />;
    case "market":
      return <MarketIcon width={width} height={height} style={style} />;
    case "female":
      return <FemaleIcon width={width} height={height} style={style} />;
    case "unisex":
      return <UnisexIcon width={width} height={height} style={style} />;
    case "kebab":
      return <KebabIcon width={width} height={height} />;
    case "clutches":
      return <EggIcon width={width} height={height} />;
    case "breeding":
      return <RelatedIcon width={width} height={height} />;
    case "check":
      return <CheckIcon width={width} height={height} />;
    case "bin":
      return <BinIcon width={width} height={height} className={className} style={style} />;
    case "arr-up":
      return <ArrUpIcon width={width} height={height} style={style} />;
    case "arr-bi":
      return <ArrBidirectIcon width={width} height={height} style={style} />;
    case "no-data":
      return <NoDataIcon width={width} height={height} />;
    case "no-filter":
      return <NoFilterIcon width={width} height={height} />;
    case "plus":
      return <PlusIcon width={width} height={height} />;
    case "search":
      return <SearchIcon width={width} height={height} />;
    case "schedule":
      return <CalendarIcon width={width} height={height} />;
    default:
      return <UnisexIcon width={width} height={height} />;
  }
};
