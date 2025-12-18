import { CSSProperties, FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
  style?: CSSProperties;
}

export const CheckIcon: FC<IIcon> = ({ width, height, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" opacity="0.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" style={style}>
    <path d="M5 12l5 5l10 -10" />
  </svg>
);
