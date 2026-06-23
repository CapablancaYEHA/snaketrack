import { FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
}

export const InfoIcon: FC<IIcon> = ({ width, height }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 9h.01" />
    <path d="M11 12h1v4h1" />
  </svg>
);
