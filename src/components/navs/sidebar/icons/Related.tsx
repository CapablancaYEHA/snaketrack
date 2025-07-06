import { FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
}

export const RelatedIcon: FC<IIcon> = ({ width, height }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet">
    <path d="M9.183 6.117a6 6 0 1 0 4.511 3.986" />
    <path d="M14.813 17.883a6 6 0 1 0 -4.496 -3.954" />
  </svg>
);
