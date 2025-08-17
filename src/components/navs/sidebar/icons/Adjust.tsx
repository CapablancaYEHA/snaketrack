import { CSSProperties, FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
  style?: CSSProperties;
}

export const AdjustIcon: FC<IIcon> = ({ width, height, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" style={style}>
    <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M6 4v4" />
    <path d="M6 12v8" />
    <path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M12 4v10" />
    <path d="M12 18v2" />
    <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M18 4v1" />
    <path d="M18 9v11" />
  </svg>
);
