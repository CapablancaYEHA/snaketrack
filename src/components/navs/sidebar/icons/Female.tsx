import { CSSProperties, FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
  style?: CSSProperties;
}

export const FemaleIcon: FC<IIcon> = ({ width, height, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" style={style}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 9m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" stroke="#FF7979" />
    <path d="M12 14v7" stroke="#FF7979" />
    <path d="M9 18h6" stroke="#FF7979" />
  </svg>
);
