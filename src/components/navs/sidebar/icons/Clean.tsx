import { CSSProperties, FC } from "preact/compat";

interface IIcon {
  isActive?: boolean;
  width: string;
  height: string;
  className?: string;
  style?: CSSProperties;
}

export const CleanIcon: FC<IIcon> = ({ width, height, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet" style={style}>
    <path d="M 5 5 L 35 35" strokeWidth="3" />
    <path
      d="M17.0798 23.5318C11.2194 23.5318 1.18542 19.6203 1.76814 26.2073C2.20477 31.143 9.11981 32.1238 17.0798 32.1238C25.0399 32.1238 31.9549 31.143 32.3915 26.2073C32.8005 21.5844 27.9801 22.1326 23.0432 22.8706M25.4652 22.5554L25.4788 22.5515C28.3248 21.7381 30.248 21.1884 30.4579 18.4729C30.8661 13.1921 25.3126 13.6871 20.4557 14.4765M8.69489 22.5554L8.68131 22.5515C5.83531 21.7381 3.91207 21.1884 3.70218 18.4729C3.31096 13.4113 8.39681 13.577 13.0966 14.3753C13.3001 14.4098 13.5028 14.4438 13.7044 14.4765M10.4663 13.9074C7.02724 12.3712 9.45905 7.23006 14.3893 7.14748C18.3966 7.08037 19.2604 5.39249 19.2604 1.45978C25.1862 1.66888 28.0971 11.6972 23.4574 13.9074"
      strokeWidth="2.1952"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
