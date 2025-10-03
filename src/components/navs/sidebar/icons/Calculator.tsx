import { CSSProperties, FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
  style?: CSSProperties;
}

export const CalculatorIcon: FC<IIcon> = ({ width, height, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" style={style}>
    <path d="M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
    <path d="M8 14l0 .01" />
    <path d="M12 14l0 .01" />
    <path d="M16 14l0 .01" />
    <path d="M8 17l0 .01" />
    <path d="M12 17l0 .01" />
    <path d="M16 17l0 .01" />
  </svg>
);
